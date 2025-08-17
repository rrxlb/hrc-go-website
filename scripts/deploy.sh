#!/bin/bash
# High Roller Club - Production Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="hrc-casino"
APP_DIR="/var/www/hrc.casino"
BACKUP_DIR="/var/backups/hrc.casino"
LOG_FILE="/var/log/deployment.log"

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

# Pre-deployment checks
pre_deployment_checks() {
    log "🔍 Running pre-deployment checks..."
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root or with sudo"
    fi
    
    # Check if app directory exists
    if [ ! -d "$APP_DIR" ]; then
        error "Application directory $APP_DIR does not exist"
    fi
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        error "PM2 is not installed"
    fi
    
    # Check if Caddy is running
    if ! systemctl is-active --quiet caddy; then
        warning "Caddy is not running"
    fi
    
    success "Pre-deployment checks passed"
}

# Create backup
create_backup() {
    log "💾 Creating backup..."
    
    DATE=$(date +%Y%m%d_%H%M%S)
    mkdir -p $BACKUP_DIR
    
    # Backup current application
    if [ -d "$APP_DIR" ]; then
        tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $(dirname $APP_DIR) $(basename $APP_DIR)
        success "Backup created: $BACKUP_DIR/app_backup_$DATE.tar.gz"
    fi
    
    # Keep only last 5 backups
    find $BACKUP_DIR -name "app_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f
}

# Deploy application
deploy_application() {
    log "🚀 Starting deployment..."
    
    cd $APP_DIR
    
    # Pull latest changes (if using Git)
    if [ -d ".git" ]; then
        log "📥 Pulling latest changes from Git..."
        git pull origin main || git pull origin master
        success "Git pull completed"
    fi
    
    # Install dependencies
    log "📦 Installing dependencies..."
    npm ci --only=production --silent
    success "Dependencies installed"
    
    # Run build
    log "🔨 Building application..."
    npm run build
    success "Build completed"
    
    # Update file permissions
    chown -R www-data:www-data $APP_DIR
    chmod -R 755 $APP_DIR
    success "File permissions updated"
}

# Health check function
health_check() {
    log "🏥 Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
            success "Health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 2 seconds..."
        sleep 2
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Restart services
restart_services() {
    log "🔄 Restarting services..."
    
    # Restart PM2 application
    if pm2 list | grep -q $APP_NAME; then
        pm2 restart $APP_NAME
        success "PM2 application restarted"
    else
        log "Starting PM2 application for the first time..."
        pm2 start ecosystem.config.js --env production
        success "PM2 application started"
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Wait for application to start
    sleep 5
    
    # Reload Caddy configuration
    if systemctl is-active --quiet caddy; then
        caddy reload --config /etc/caddy/Caddyfile
        success "Caddy configuration reloaded"
    fi
}

# Post-deployment tasks
post_deployment() {
    log "🧹 Running post-deployment tasks..."
    
    # Clear any caches if needed
    if [ -d "$APP_DIR/.next/cache" ]; then
        rm -rf $APP_DIR/.next/cache/*
        success "Next.js cache cleared"
    fi
    
    # Update PM2 startup script
    pm2 startup > /dev/null 2>&1 || true
    
    # Log deployment completion
    echo "Deployment completed at $(date)" >> /var/log/deployments.log
    
    success "Post-deployment tasks completed"
}

# Rollback function
rollback() {
    log "🔄 Rolling back to previous version..."
    
    # Find latest backup
    LATEST_BACKUP=$(find $BACKUP_DIR -name "app_backup_*.tar.gz" -type f | sort -r | head -n 1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    # Stop application
    pm2 stop $APP_NAME || true
    
    # Remove current application
    rm -rf $APP_DIR
    
    # Restore from backup
    mkdir -p $(dirname $APP_DIR)
    tar -xzf $LATEST_BACKUP -C $(dirname $APP_DIR)
    
    # Restart application
    cd $APP_DIR
    pm2 start ecosystem.config.js --env production
    
    success "Rollback completed using backup: $LATEST_BACKUP"
}

# Main deployment process
main() {
    log "🎯 Starting High Roller Club deployment process..."
    
    case "${1:-deploy}" in
        "deploy")
            pre_deployment_checks
            create_backup
            deploy_application
            restart_services
            health_check
            post_deployment
            success "🎉 Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health}"
            echo "  deploy   - Deploy the application (default)"
            echo "  rollback - Rollback to previous version"
            echo "  health   - Run health check only"
            exit 1
            ;;
    esac
}

# Trap errors and provide rollback option
trap 'error "Deployment failed! Run \"$0 rollback\" to restore previous version."' ERR

# Run main function
main "$@"