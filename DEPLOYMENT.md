# High Roller Club Website - Production Deployment Guide

This guide covers the production deployment configuration and best practices for the High Roller Club website.

## Prerequisites

- Node.js 20+ 
- npm or yarn
- Docker (optional, for containerized deployment)
- CDN service (recommended for global asset delivery)

## Environment Configuration

### Production Environment Variables

Copy `.env.production` and configure the following variables:

```bash
# Required
NODE_ENV=production
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain.com

# Optional but recommended
NEXT_PUBLIC_ANALYTICS_ENABLED=true
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook
```

### Development vs Production

| Setting | Development | Production |
|---------|-------------|------------|
| Source Maps | Enabled | Disabled |
| Console Logging | Enabled | Error/Warn only |
| Bundle Analysis | Optional | Disabled |
| Asset Compression | Disabled | Enabled |
| CDN | Disabled | Enabled |
| Analytics | Disabled | Enabled |

## Build Process

### Standard Build

```bash
# Install dependencies
npm ci --only=production

# Run pre-build checks
npm run lint
npm run type-check

# Build for production
npm run build:production

# Validate build
npm run validate:build

# Start production server
npm run start:production
```

### Build with Analysis

```bash
# Build with bundle analyzer
npm run build:analyze

# View bundle report
open bundle-analyzer-report.html
```

## Asset Optimization

### Automatic Optimization

The build process automatically optimizes:

- **Images**: WebP/AVIF conversion, compression
- **3D Models**: GLTF/GLB compression, LOD generation
- **Audio**: MP3 compression, bitrate optimization
- **JavaScript**: Minification, tree-shaking, code splitting
- **CSS**: Minification, unused CSS removal

### Manual Optimization

```bash
# Optimize assets manually
npm run optimize:images

# Validate asset sizes
node scripts/validate-build.js
```

## CDN Configuration

### Setup

1. Configure your CDN service (CloudFront, Cloudflare, etc.)
2. Set `NEXT_PUBLIC_CDN_URL` environment variable
3. Configure cache headers for different asset types:

```
Images: Cache-Control: public, max-age=31536000, immutable
Models: Cache-Control: public, max-age=31536000, immutable
Audio:  Cache-Control: public, max-age=31536000, immutable
Static: Cache-Control: public, max-age=86400
```

### Asset Delivery

Assets are automatically routed through CDN when configured:

- Images: Optimized format selection (AVIF → WebP → JPEG)
- 3D Models: Compressed GLTF/GLB with progressive loading
- Audio: Compressed MP3 with quality adjustment

## Docker Deployment

### Build Docker Image

```bash
# Build production image
docker build -t high-roller-club-website .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_CDN_URL=https://your-cdn.com \
  high-roller-club-website
```

### Docker Compose

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_CDN_URL=https://your-cdn.com
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Performance Monitoring

### Health Checks

The application provides a health check endpoint:

```bash
# Check application health
curl http://localhost:3000/api/health

# Simple health check
curl -I http://localhost:3000/api/health
```

### Performance Metrics

Monitor these key metrics:

- **Bundle Size**: < 5MB total
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 4s
- **Cumulative Layout Shift**: < 0.1
- **3D Rendering FPS**: 60fps target

### Build Validation

```bash
# Validate build before deployment
npm run validate:build
```

This checks:
- Bundle sizes within limits
- Required files present
- Environment configuration
- Package.json validity

## Security Configuration

### Content Security Policy

Production builds enable CSP headers:

```
default-src 'self';
script-src 'self' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https:;
```

### Security Headers

Automatically configured headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Deployment Platforms

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Netlify

```bash
# Build command
npm run build:production

# Publish directory
.next
```

### AWS/GCP/Azure

Use the Docker configuration for container-based deployment.

## Troubleshooting

### Common Issues

1. **Large Bundle Size**
   - Run `npm run build:analyze` to identify large chunks
   - Consider code splitting or lazy loading

2. **Slow 3D Rendering**
   - Check LOD system is enabled
   - Verify texture compression
   - Monitor memory usage

3. **CDN Issues**
   - Verify CDN URL configuration
   - Check CORS headers
   - Test asset loading

### Debug Mode

Enable debug mode in production (not recommended):

```bash
NEXT_PUBLIC_DEBUG_MODE=true npm run start:production
```

## Performance Optimization Checklist

- [ ] Bundle size < 5MB
- [ ] Images optimized (WebP/AVIF)
- [ ] 3D models compressed
- [ ] CDN configured
- [ ] Caching headers set
- [ ] Source maps disabled
- [ ] Console logging minimized
- [ ] Analytics configured
- [ ] Health checks working
- [ ] Security headers enabled

## Monitoring and Alerts

Set up monitoring for:

- Application uptime
- Response times
- Error rates
- Memory usage
- 3D rendering performance
- CDN hit rates

## Support

For deployment issues:
1. Check build validation output
2. Review health check endpoint
3. Monitor application logs
4. Verify environment configuration