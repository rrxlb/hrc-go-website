#!/usr/bin/env node

/**
 * Asset optimization script for production builds
 * Optimizes images, models, and other static assets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BUILD_DIR = path.join(__dirname, '..', '.next');

/**
 * Log with timestamp
 */
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Get file size in MB
 */
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

/**
 * Optimize images in public directory
 */
function optimizeImages() {
  log('Starting image optimization...');
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const publicFiles = fs.readdirSync(PUBLIC_DIR, { recursive: true });
  
  let optimizedCount = 0;
  let totalSavings = 0;
  
  publicFiles.forEach(file => {
    const filePath = path.join(PUBLIC_DIR, file);
    const ext = path.extname(file).toLowerCase();
    
    if (imageExtensions.includes(ext) && fs.statSync(filePath).isFile()) {
      const originalSize = parseFloat(getFileSizeMB(filePath));
      
      try {
        // Simple optimization - in production, you'd use tools like imagemin
        log(`Optimizing ${file} (${originalSize}MB)`);
        
        // Placeholder for actual optimization
        // In real implementation, you'd use imagemin, sharp, or similar
        
        const newSize = parseFloat(getFileSizeMB(filePath));
        const savings = originalSize - newSize;
        
        if (savings > 0) {
          totalSavings += savings;
          optimizedCount++;
          log(`✓ Optimized ${file}: ${originalSize}MB → ${newSize}MB (saved ${savings.toFixed(2)}MB)`);
        }
      } catch (error) {
        log(`✗ Failed to optimize ${file}: ${error.message}`);
      }
    }
  });
  
  log(`Image optimization complete: ${optimizedCount} files optimized, ${totalSavings.toFixed(2)}MB saved`);
}

/**
 * Validate 3D models and assets
 */
function validateAssets() {
  log('Validating 3D models and assets...');
  
  const modelExtensions = ['.glb', '.gltf'];
  const audioExtensions = ['.mp3', '.wav', '.ogg'];
  
  const publicFiles = fs.readdirSync(PUBLIC_DIR, { recursive: true });
  
  let validModels = 0;
  let validAudio = 0;
  let issues = [];
  
  publicFiles.forEach(file => {
    const filePath = path.join(PUBLIC_DIR, file);
    const ext = path.extname(file).toLowerCase();
    
    if (!fs.statSync(filePath).isFile()) return;
    
    const fileSize = parseFloat(getFileSizeMB(filePath));
    
    if (modelExtensions.includes(ext)) {
      if (fileSize > 10) { // 10MB limit for models
        issues.push(`Model ${file} is too large: ${fileSize}MB (limit: 10MB)`);
      } else {
        validModels++;
      }
    } else if (audioExtensions.includes(ext)) {
      if (fileSize > 5) { // 5MB limit for audio
        issues.push(`Audio ${file} is too large: ${fileSize}MB (limit: 5MB)`);
      } else {
        validAudio++;
      }
    }
  });
  
  log(`Asset validation complete: ${validModels} models, ${validAudio} audio files`);
  
  if (issues.length > 0) {
    log('⚠️  Asset issues found:');
    issues.forEach(issue => log(`  - ${issue}`));
  } else {
    log('✓ All assets validated successfully');
  }
  
  return issues.length === 0;
}

/**
 * Generate asset manifest for CDN
 */
function generateAssetManifest() {
  log('Generating asset manifest...');
  
  const manifest = {
    generated: new Date().toISOString(),
    assets: {
      images: [],
      models: [],
      audio: [],
      static: []
    }
  };
  
  const publicFiles = fs.readdirSync(PUBLIC_DIR, { recursive: true });
  
  publicFiles.forEach(file => {
    const filePath = path.join(PUBLIC_DIR, file);
    
    if (!fs.statSync(filePath).isFile()) return;
    
    const ext = path.extname(file).toLowerCase();
    const size = parseFloat(getFileSizeMB(filePath));
    
    const assetInfo = {
      path: file,
      size: `${size}MB`,
      lastModified: fs.statSync(filePath).mtime.toISOString()
    };
    
    if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
      manifest.assets.images.push(assetInfo);
    } else if (['.glb', '.gltf'].includes(ext)) {
      manifest.assets.models.push(assetInfo);
    } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
      manifest.assets.audio.push(assetInfo);
    } else {
      manifest.assets.static.push(assetInfo);
    }
  });
  
  const manifestPath = path.join(PUBLIC_DIR, 'asset-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  log(`✓ Asset manifest generated: ${manifestPath}`);
  log(`  - ${manifest.assets.images.length} images`);
  log(`  - ${manifest.assets.models.length} models`);
  log(`  - ${manifest.assets.audio.length} audio files`);
  log(`  - ${manifest.assets.static.length} static files`);
}

/**
 * Main optimization process
 */
function main() {
  log('Starting asset optimization for production build...');
  
  try {
    // Check if public directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
      log('⚠️  Public directory not found, skipping asset optimization');
      return;
    }
    
    // Run optimization steps
    optimizeImages();
    const assetsValid = validateAssets();
    generateAssetManifest();
    
    if (!assetsValid) {
      log('⚠️  Asset validation failed - please review issues above');
      process.exit(1);
    }
    
    log('✓ Asset optimization completed successfully');
    
  } catch (error) {
    log(`✗ Asset optimization failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { optimizeImages, validateAssets, generateAssetManifest };