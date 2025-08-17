#!/usr/bin/env node

/**
 * Build validation script for production deployments
 * Validates bundle sizes, performance metrics, and deployment readiness
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', '.next');
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');

/**
 * Log with timestamp and color
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Get file size in MB
 */
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

/**
 * Get directory size recursively
 */
function getDirectorySizeMB(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    }
  }
  
  calculateSize(dirPath);
  return (totalSize / (1024 * 1024)).toFixed(2);
}

/**
 * Validate bundle sizes
 */
function validateBundleSizes() {
  log('Validating bundle sizes...', 'info');
  
  const staticDir = path.join(BUILD_DIR, 'static');
  const chunksDir = path.join(staticDir, 'chunks');
  
  if (!fs.existsSync(BUILD_DIR)) {
    log('Build directory not found. Run "npm run build" first.', 'error');
    return false;
  }
  
  const buildSize = parseFloat(getDirectorySizeMB(BUILD_DIR));
  const maxBuildSize = 50; // 50MB limit
  
  log(`Total build size: ${buildSize}MB`, buildSize > maxBuildSize ? 'warning' : 'success');
  
  if (buildSize > maxBuildSize) {
    log(`⚠️  Build size exceeds ${maxBuildSize}MB limit`, 'warning');
  }
  
  // Check individual chunk sizes
  if (fs.existsSync(chunksDir)) {
    const chunks = fs.readdirSync(chunksDir);
    let largeChunks = [];
    
    chunks.forEach(chunk => {
      const chunkPath = path.join(chunksDir, chunk);
      if (fs.statSync(chunkPath).isFile() && chunk.endsWith('.js')) {
        const chunkSize = parseFloat(getFileSizeMB(chunkPath));
        if (chunkSize > 1) { // 1MB limit per chunk
          largeChunks.push({ name: chunk, size: chunkSize });
        }
      }
    });
    
    if (largeChunks.length > 0) {
      log('Large chunks detected:', 'warning');
      largeChunks.forEach(chunk => {
        log(`  - ${chunk.name}: ${chunk.size}MB`, 'warning');
      });
    } else {
      log('✓ All chunks are within size limits', 'success');
    }
  }
  
  return buildSize <= maxBuildSize;
}

/**
 * Validate required files and configurations
 */
function validateRequiredFiles() {
  log('Validating required files...', 'info');
  
  const requiredFiles = [
    path.join(BUILD_DIR, 'BUILD_ID'),
    path.join(BUILD_DIR, 'static'),
    path.join(__dirname, '..', 'next.config.ts'),
    path.join(__dirname, '..', 'tailwind.config.ts'),
    PACKAGE_JSON
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      log(`✓ ${path.basename(filePath)} exists`, 'success');
    } else {
      log(`✗ ${path.basename(filePath)} missing`, 'error');
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

/**
 * Validate environment configuration
 */
function validateEnvironment() {
  log('Validating environment configuration...', 'info');
  
  const requiredEnvVars = [
    'NODE_ENV'
  ];
  
  const optionalEnvVars = [
    'NEXT_PUBLIC_CDN_URL',
    'NEXT_PUBLIC_ANALYTICS_ENABLED',
    'DISCORD_WEBHOOK_URL'
  ];
  
  let envValid = true;
  
  // Check required environment variables
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`✓ ${envVar} is set`, 'success');
    } else {
      log(`✗ ${envVar} is not set`, 'error');
      envValid = false;
    }
  });
  
  // Check optional environment variables
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`✓ ${envVar} is configured`, 'info');
    } else {
      log(`- ${envVar} is not set (optional)`, 'warning');
    }
  });
  
  return envValid;
}

/**
 * Validate package.json configuration
 */
function validatePackageJson() {
  log('Validating package.json...', 'info');
  
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  
  const requiredScripts = ['build', 'start', 'lint'];
  const requiredDependencies = ['next', 'react', 'react-dom'];
  
  let packageValid = true;
  
  // Check required scripts
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      log(`✓ Script "${script}" exists`, 'success');
    } else {
      log(`✗ Script "${script}" missing`, 'error');
      packageValid = false;
    }
  });
  
  // Check required dependencies
  requiredDependencies.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log(`✓ Dependency "${dep}" exists`, 'success');
    } else {
      log(`✗ Dependency "${dep}" missing`, 'error');
      packageValid = false;
    }
  });
  
  return packageValid;
}

/**
 * Generate build report
 */
function generateBuildReport() {
  log('Generating build report...', 'info');
  
  const report = {
    timestamp: new Date().toISOString(),
    buildSize: fs.existsSync(BUILD_DIR) ? `${getDirectorySizeMB(BUILD_DIR)}MB` : 'N/A',
    nodeVersion: process.version,
    npmVersion: 'N/A', // Would be populated by actual npm version
    environment: process.env.NODE_ENV || 'unknown',
    validation: {
      bundleSizes: false,
      requiredFiles: false,
      environment: false,
      packageJson: false
    }
  };
  
  // Run validations
  report.validation.bundleSizes = validateBundleSizes();
  report.validation.requiredFiles = validateRequiredFiles();
  report.validation.environment = validateEnvironment();
  report.validation.packageJson = validatePackageJson();
  
  // Write report
  const reportPath = path.join(BUILD_DIR, 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`Build report generated: ${reportPath}`, 'success');
  
  return report;
}

/**
 * Main validation process
 */
function main() {
  log('Starting build validation...', 'info');
  
  try {
    const report = generateBuildReport();
    
    const allValid = Object.values(report.validation).every(valid => valid);
    
    if (allValid) {
      log('✓ Build validation passed - ready for deployment!', 'success');
      process.exit(0);
    } else {
      log('✗ Build validation failed - please fix issues above', 'error');
      process.exit(1);
    }
    
  } catch (error) {
    log(`Build validation error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateBundleSizes,
  validateRequiredFiles,
  validateEnvironment,
  validatePackageJson,
  generateBuildReport
};