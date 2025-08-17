#!/bin/bash
# High Roller Club - Server Setup Script for DigitalOcean

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
LOG_FILE="/var/log/server-setup.log"

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

# Get domain from user
get_domain() {
    if [ -z "$DOMAIN" ]; then
        echo -e "${YELLOW}Please enter your domain name (e.g., highrollerclub.com):${NC}"
        read -r DOMAIN
        
        if [ -z "$DOMAIN" ]; then
            error "Domain name is required"
        fi
    fi
    
    log "Setting up server for domain: $DOMAIN"
}

# Update system
update_system() {
    log "🔄 Updating system packages..."
    apt update && apt upgrade -y
    success "System updated"
}

# Install Node.js 20
install_nodejs() {
    log "📦 Installing Node.js 20..."
    
    # Remove any existing Node.js
    apt remove -y nodejs npm || true
    
    # Install Node.js 20 via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    
    log "Node.js version: $NODE_VERSION"
    log "npm version: $NPM_VERSION"
    
    success "Node.js 20 installed"
}

# Install Caddy
install_caddy() {
    log "🌐 Installing Caddy web server..."
    
    # Install dependencies
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    
    # Add Caddy repository
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    
    # Install Caddy
    apt update
    apt install -y caddy
    
    # Verify installation
    CADDY_VERSION=$(caddy version)
    log "Caddy version: $CADDY_VERSION"
    
    success "Caddy installed"
}

# Install PM2
install_pm2() {
    log "⚙️ Installing PM2 process manager..."
    
    npm install -g pm2
    
    # Verify installation
    PM2_VERSION=$(pm2 --version)
    log "PM2 version: $PM2_VERSION"
    
    success "PM2 installed"
}

# Setup firewall
setup_firewall() {
    log "🔥 Configuring firewall..."
    
    # Install UFW if not present
    apt install -y ufw
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (important!)
    ufw allow ssh
    ufw allow 22
    
    # Allow HTTP and HTTPS
    ufw allow 80
    ufw allow 443
    
    # Enable firewall
    ufw --force enable
    
    # Show status
    ufw status
    
    success "Firewall configured"
}

# Create application directory
create_app_directory() {
    log "📁 Creating application directory..."
    
    mkdir -p $APP_DIR
    mkdir -p /var/log/pm2
    mkdir -p /var/log/caddy
    mkdir -p /var/backups/high-roller-club
    
    # Set permissions
    chown -R www-data:www-data $APP_DIR
    chmod -R 755 $APP_DIR
    
    success "Application directory created: $APP_DIR"
}

# Create Caddyfile
create_caddyfile() {
    log "📝 Creating Caddy configuration..."
    
    cat > /etc/caddy/Caddyfile << EOF
# High Roller Club - Caddy Configuration
$DOMAIN {
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
        root * $APP_DIR/.next/static
        file_server
        header Cache-Control "public, max-age=31536000, immutable"
    }
    
    # Handle public files
    handle_path /public/* {
        root * $APP_DIR/public
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
        output file /var/log/caddy/access.log {
            roll_size 100mb
            roll_keep 5
            roll_keep_for 720h
        }
        format json
    }
}

# Redirect www to non-www
www.$DOMAIN {
    redir https://$DOMAIN{uri} permanent
}
EOF
    
    success "Caddyfile created"
}

# Create PM2 ecosystem file
create_pm2_config() {
    log "⚙️ Creating PM2 configuration..."
    
    cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'high-roller-club',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/high-roller-club',
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
    log_file: '/var/log/pm2/high-roller-club.log',
    out_file: '/var/log/pm2/high-roller-club-out.log',
    error_file: '/var/log/pm2/high-roller-club-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};
EOF
    
    success "PM2 ecosystem configuration created"
}

# Setup services
setup_services() {
    log "🔧 Setting up services..."
    
    # Enable and start Caddy
    systemctl enable caddy
    systemctl start caddy
    
    # Setup PM2 startup
    pm2 startup systemd -u root --hp /root
    
    success "Services configured"
}

# Create maintenance scripts
create_maintenance_scripts() {
    log "🛠️ Creating maintenance scripts..."
    
    # Create backup script
    cat > /usr/local/bin/backup-high-roller-club << 'EOF'
#!/bin/bash
# High Roller Club Backup Script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/high-roller-club"
APP_DIR="/var/www/high-roller-club"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www high-roller-club

# Backup Caddy config
cp /etc/caddy/Caddyfile $BACKUP_DIR/Caddyfile_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "Caddyfile_*" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x /usr/local/bin/backup-high-roller-club
    
    # Create monitoring script
    cat > /usr/local/bin/monitor-high-roller-club << 'EOF'
#!/bin/bash
# High Roller Club Monitoring Script

echo "=== High Roller Club Status ==="
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
pm2 logs high-roller-club --lines 10 --nostream
EOF
    
    chmod +x /usr/local/bin/monitor-high-roller-club
    
    success "Maintenance scripts created"
}

# Setup cron jobs
setup_cron_jobs() {
    log "⏰ Setting up cron jobs..."
    
    # Add backup cron job (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-high-roller-club") | crontab -
    
    # Add system update cron job (weekly on Sunday at 3 AM)
    (crontab -l 2>/dev/null; echo "0 3 * * 0 apt update && apt upgrade -y") | crontab -
    
    success "Cron jobs configured"
}

# Final instructions
show_final_instructions() {
    log "📋 Setup completed! Here are your next steps:"
    
    echo ""
    echo -e "${GREEN}🎉 Server setup completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Upload your application code to: $APP_DIR"
    echo "2. Create your .env.production.local file with your configuration"
    echo "3. Run the deployment script: $APP_DIR/scripts/deploy.sh"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo "• Monitor application: /usr/local/bin/monitor-high-roller-club"
    echo "• Create backup: /usr/local/bin/backup-high-roller-club"
    echo "• View PM2 logs: pm2 logs high-roller-club"
    echo "• View Caddy logs: journalctl -u caddy -f"
    echo "• Restart application: pm2 restart high-roller-club"
    echo "• Reload Caddy: caddy reload --config /etc/caddy/Caddyfile"
    echo ""
    echo -e "${YELLOW}Your domain:${NC} https://$DOMAIN"
    echo -e "${YELLOW}SSL certificates:${NC} Will be automatically obtained by Caddy"
    echo ""
    echo -e "${GREEN}Setup log saved to: $LOG_FILE${NC}"
}

# Main setup process
main() {
    log "🚀 Starting High Roller Club server setup..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
    
    get_domain
    update_system
    install_nodejs
    install_caddy
    install_pm2
    setup_firewall
    create_app_directory
    create_caddyfile
    create_pm2_config
    setup_services
    create_maintenance_scripts
    setup_cron_jobs
    show_final_instructions
}

# Run main function
main "$@"