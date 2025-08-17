#!/bin/bash
# High Roller Club - Clean Existing Site and Deploy New One
# For hrc.casino domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="hrc.casino"
APP_DIR="/var/www/hrc.casino"
BACKUP_DIR="/var/backups/hrc.casino"
OLD_BACKUP_DIR="/var/backups/old-hrc-casino"
LOG_FILE="/var/log/hrc-casino-deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check if running as root
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root or with sudo"
    fi
}

# Backup existing website
backup_existing_site() {
    log "🔄 Backing up existing website..."
    
    DATE=$(date +%Y%m%d_%H%M%S)
    mkdir -p $OLD_BACKUP_DIR
    
    if [ -d "$APP_DIR" ]; then
        log "Creating backup of existing site..."
        tar -czf $OLD_BACKUP_DIR/old-site-backup-$DATE.tar.gz -C $(dirname $APP_DIR) $(basename $APP_DIR)
        success "Existing site backed up to: $OLD_BACKUP_DIR/old-site-backup-$DATE.tar.gz"
    else
        log "No existing site found at $APP_DIR"
    fi
}

# Stop existing services
stop_existing_services() {
    log "🛑 Stopping existing services..."
    
    # Stop any PM2 processes that might be running
    if command -v pm2 &> /dev/null; then
        pm2 stop all || true
        pm2 delete all || true
        success "Stopped all PM2 processes"
    fi
    
    # Stop Caddy if running
    if systemctl is-active --quiet caddy; then
        systemctl stop caddy
        success "Stopped Caddy"
    fi
    
    # Stop any processes using port 3000
    if lsof -ti:3000 &> /dev/null; then
        log "Killing processes on port 3000..."
        lsof -ti:3000 | xargs kill -9 || true
        success "Cleared port 3000"
    fi
}

# Clean existing directory
clean_existing_directory() {
    log "🧹 Cleaning existing directory..."
    
    if [ -d "$APP_DIR" ]; then
        log "Removing existing directory: $APP_DIR"
        rm -rf $APP_DIR
        success "Existing directory removed"
    fi
    
    # Create fresh directory structure
    mkdir -p $APP_DIR
    mkdir -p $BACKUP_DIR
    mkdir -p /var/log/pm2
    mkdir -p /var/log/caddy
    
    success "Created fresh directory structure"
}

# Set up directory permissions
setup_permissions() {
    log "🔐 Setting up directory permissions..."
    
    # Create www-data user if it doesn't exist
    if ! id "www-data" &>/dev/null; then
        useradd -r -s /bin/false www-data
    fi
    
    chown -R www-data:www-data $APP_DIR
    chmod -R 755 $APP_DIR
    
    success "Directory permissions configured"
}

# Update Caddyfile for new domain
update_caddyfile() {
    log "📝 Updating Caddyfile for hrc.casino..."
    
    cat > /etc/caddy/Caddyfile << 'EOF'
# High Roller Club Casino - Caddy Configuration
hrc.casino {
    # Reverse proxy to Next.js app
    reverse_proxy localhost:3000
    
    # Enable compression
    encode gzip zstd
    
    # Security headers
    header {
        # Security headers
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        
        # Remove server info
        -Server
        
        # Cache headers for static assets
        @static {
            path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2 *.ttf *.eot *.webp *.avif
        }
        @static Cache-Control "public, max-age=31536000, immutable"
        
        # Cache headers for 3D models and audio
        @assets {
            path *.glb *.gltf *.mp3 *.wav *.ogg
        }
        @assets Cache-Control "public, max-age=31536000, immutable"
    }
    
    # Handle Next.js static files
    handle_path /_next/static/* {
        root * /var/www/hrc.casino/.next/static
        file_server
        header Cache-Control "public, max-age=31536000, immutable"
    }
    
    # Handle public files
    handle_path /public/* {
        root * /var/www/hrc.casino/public
        file_server
        header Cache-Control "public, max-age=86400"
    }
    
    # Health check endpoint
    handle /health {
        reverse_proxy localhost:3000
    }
    
    # All other requests go to Next.js
    handle {
        reverse_proxy localhost:3000 {
            # Health check
            health_uri /api/health
            health_interval 30s
            health_timeout 5s
            
            # Load balancing
            lb_policy round_robin
            
            # Headers
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
        }
    }
    
    # Logging
    log {
        output file /var/log/caddy/hrc-casino-access.log {
            roll_size 100mb
            roll_keep 5
            roll_keep_for 720h
        }
        format json
    }
}

# Redirect www to non-www
www.hrc.casino {
    redir https://hrc.casino{uri} permanent
}
EOF
    
    success "Caddyfile updated for hrc.casino"
}

# Create PM2 ecosystem file
create_pm2_config() {
    log "⚙️ Creating PM2 configuration..."
    
    cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'hrc-casino',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hrc.casino',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Restart settings
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // Logging
    log_file: '/var/log/pm2/hrc-casino.log',
    out_file: '/var/log/pm2/hrc-casino-out.log',
    error_file: '/var/log/pm2/hrc-casino-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};
EOF
    
    success "PM2 ecosystem configuration created"
}

# Update maintenance scripts
update_maintenance_scripts() {
    log "🛠️ Updating maintenance scripts..."
    
    # Update backup script
    cat > /usr/local/bin/backup-hrc-casino << 'EOF'
#!/bin/bash
# HRC Casino Backup Script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/hrc.casino"
APP_DIR="/var/www/hrc.casino"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www hrc.casino

# Backup Caddy config
cp /etc/caddy/Caddyfile $BACKUP_DIR/Caddyfile_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "Caddyfile_*" -mtime +7 -delete

echo "HRC Casino backup completed: $DATE"
EOF
    
    chmod +x /usr/local/bin/backup-hrc-casino
    
    # Update monitoring script
    cat > /usr/local/bin/monitor-hrc-casino << 'EOF'
#!/bin/bash
# HRC Casino Monitoring Script

echo "=== HRC Casino Status ==="
echo "Date: $(date)"
echo ""

echo "=== PM2 Status ==="
pm2 status
echo ""

echo "=== Caddy Status ==="
systemctl status caddy --no-pager
echo ""

echo "=== Health Check ==="
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Application is healthy"
else
    echo "❌ Application health check failed"
fi
echo ""

echo "=== System Resources ==="
echo "Memory Usage:"
free -h
echo ""
echo "Disk Usage:"
df -h /
echo ""

echo "=== Recent Logs ==="
echo "PM2 Logs (last 10 lines):"
pm2 logs hrc-casino --lines 10 --nostream
EOF
    
    chmod +x /usr/local/bin/monitor-hrc-casino
    
    success "Maintenance scripts updated"
}

# Update cron jobs
update_cron_jobs() {
    log "⏰ Updating cron jobs..."
    
    # Remove old cron jobs
    crontab -l 2>/dev/null | grep -v "backup-high-roller-club" | crontab - || true
    
    # Add new backup cron job (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-hrc-casino") | crontab -
    
    success "Cron jobs updated"
}

# Main cleanup and preparation process
main() {
    log "🎯 Starting HRC Casino site cleanup and preparation..."
    
    check_permissions
    backup_existing_site
    stop_existing_services
    clean_existing_directory
    setup_permissions
    update_caddyfile
    create_pm2_config
    update_maintenance_scripts
    update_cron_jobs
    
    success "🎉 Site cleanup and preparation completed!"
    
    echo ""
    echo -e "${GREEN}🎰 HRC Casino Deployment Ready!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Upload your High Roller Club website files to: $APP_DIR"
    echo "2. Create your .env.production.local file with your configuration"
    echo "3. Run the deployment script: $APP_DIR/scripts/deploy.sh"
    echo ""
    echo -e "${YELLOW}Your old website backup is saved at:${NC}"
    echo "$OLD_BACKUP_DIR/"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo "• Monitor application: /usr/local/bin/monitor-hrc-casino"
    echo "• Create backup: /usr/local/bin/backup-hrc-casino"
    echo "• View PM2 logs: pm2 logs hrc-casino"
    echo "• View Caddy logs: journalctl -u caddy -f"
    echo ""
    echo -e "${GREEN}Your domain: https://hrc.casino${NC}"
}

# Run main function
main "$@"