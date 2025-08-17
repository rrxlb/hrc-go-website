/**
 * Environment-specific configuration for development and production
 * Handles feature flags, performance settings, and deployment configurations
 */

export type Environment = 'development' | 'production' | 'test';

interface EnvironmentConfig {
  environment: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  
  // Performance settings
  performance: {
    enablePerformanceMonitoring: boolean;
    enableBundleAnalyzer: boolean;
    enableSourceMaps: boolean;
    enableConsoleLogging: boolean;
    maxBundleSize: number;
    targetFPS: number;
  };

  // Asset settings
  assets: {
    enableCDN: boolean;
    enableCompression: boolean;
    enableOptimization: boolean;
    cacheMaxAge: number;
    preloadCriticalAssets: boolean;
  };

  // 3D rendering settings
  rendering: {
    enableAntialiasing: boolean;
    shadowMapSize: number;
    maxLights: number;
    enableLOD: boolean;
    pixelRatio: number;
  };

  // Analytics settings
  analytics: {
    enabled: boolean;
    samplingRate: number;
    enableErrorTracking: boolean;
    enablePerformanceTracking: boolean;
  };

  // Security settings
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;
    enableXSSProtection: boolean;
  };

  // Feature flags
  features: {
    enableExperimentalFeatures: boolean;
    enableBetaFeatures: boolean;
    enableDebugMode: boolean;
  };
}

/**
 * Get current environment
 */
function getCurrentEnvironment(): Environment {
  if (typeof window !== 'undefined') {
    // Client-side environment detection
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'development'
      : 'production';
  }

  // Server-side environment detection
  return (process.env.NODE_ENV as Environment) || 'development';
}

/**
 * Development configuration
 */
const developmentConfig: EnvironmentConfig = {
  environment: 'development',
  isDevelopment: true,
  isProduction: false,
  isTest: false,

  performance: {
    enablePerformanceMonitoring: true,
    enableBundleAnalyzer: false,
    enableSourceMaps: true,
    enableConsoleLogging: true,
    maxBundleSize: 10 * 1024 * 1024, // 10MB
    targetFPS: 60,
  },

  assets: {
    enableCDN: false,
    enableCompression: false,
    enableOptimization: false,
    cacheMaxAge: 0,
    preloadCriticalAssets: false,
  },

  rendering: {
    enableAntialiasing: true,
    shadowMapSize: 1024,
    maxLights: 8,
    enableLOD: false,
    pixelRatio: Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1),
  },

  analytics: {
    enabled: false,
    samplingRate: 1.0,
    enableErrorTracking: true,
    enablePerformanceTracking: true,
  },

  security: {
    enableCSP: false,
    enableHSTS: false,
    enableXSSProtection: true,
  },

  features: {
    enableExperimentalFeatures: true,
    enableBetaFeatures: true,
    enableDebugMode: true,
  },
};

/**
 * Production configuration
 */
const productionConfig: EnvironmentConfig = {
  environment: 'production',
  isDevelopment: false,
  isProduction: true,
  isTest: false,

  performance: {
    enablePerformanceMonitoring: true,
    enableBundleAnalyzer: false,
    enableSourceMaps: false,
    enableConsoleLogging: false,
    maxBundleSize: 5 * 1024 * 1024, // 5MB
    targetFPS: 60,
  },

  assets: {
    enableCDN: true,
    enableCompression: true,
    enableOptimization: true,
    cacheMaxAge: 31536000, // 1 year
    preloadCriticalAssets: true,
  },

  rendering: {
    enableAntialiasing: true,
    shadowMapSize: 2048,
    maxLights: 6,
    enableLOD: true,
    pixelRatio: Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1),
  },

  analytics: {
    enabled: true,
    samplingRate: 0.1, // 10% sampling in production
    enableErrorTracking: true,
    enablePerformanceTracking: true,
  },

  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
  },

  features: {
    enableExperimentalFeatures: false,
    enableBetaFeatures: false,
    enableDebugMode: false,
  },
};

/**
 * Test configuration
 */
const testConfig: EnvironmentConfig = {
  environment: 'test',
  isDevelopment: false,
  isProduction: false,
  isTest: true,

  performance: {
    enablePerformanceMonitoring: false,
    enableBundleAnalyzer: false,
    enableSourceMaps: true,
    enableConsoleLogging: false,
    maxBundleSize: 10 * 1024 * 1024, // 10MB
    targetFPS: 30, // Lower FPS for testing
  },

  assets: {
    enableCDN: false,
    enableCompression: false,
    enableOptimization: false,
    cacheMaxAge: 0,
    preloadCriticalAssets: false,
  },

  rendering: {
    enableAntialiasing: false,
    shadowMapSize: 512,
    maxLights: 4,
    enableLOD: false,
    pixelRatio: 1,
  },

  analytics: {
    enabled: false,
    samplingRate: 0,
    enableErrorTracking: false,
    enablePerformanceTracking: false,
  },

  security: {
    enableCSP: false,
    enableHSTS: false,
    enableXSSProtection: false,
  },

  features: {
    enableExperimentalFeatures: false,
    enableBetaFeatures: false,
    enableDebugMode: false,
  },
};

/**
 * Get configuration for current environment
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

// Export current environment configuration
export const envConfig = getEnvironmentConfig();

/**
 * Environment-specific utilities
 */
export const env = {
  // Environment checks
  isDevelopment: envConfig.isDevelopment,
  isProduction: envConfig.isProduction,
  isTest: envConfig.isTest,
  current: envConfig.environment,

  // Feature flags
  isFeatureEnabled: (feature: keyof EnvironmentConfig['features']): boolean => {
    return envConfig.features[feature];
  },

  // Performance settings
  getPerformanceSetting: <K extends keyof EnvironmentConfig['performance']>(
    setting: K
  ): EnvironmentConfig['performance'][K] => {
    return envConfig.performance[setting];
  },

  // Asset settings
  getAssetSetting: <K extends keyof EnvironmentConfig['assets']>(
    setting: K
  ): EnvironmentConfig['assets'][K] => {
    return envConfig.assets[setting];
  },

  // Rendering settings
  getRenderingSetting: <K extends keyof EnvironmentConfig['rendering']>(
    setting: K
  ): EnvironmentConfig['rendering'][K] => {
    return envConfig.rendering[setting];
  },

  // Analytics settings
  getAnalyticsSetting: <K extends keyof EnvironmentConfig['analytics']>(
    setting: K
  ): EnvironmentConfig['analytics'][K] => {
    return envConfig.analytics[setting];
  },

  // Security settings
  getSecuritySetting: <K extends keyof EnvironmentConfig['security']>(
    setting: K
  ): EnvironmentConfig['security'][K] => {
    return envConfig.security[setting];
  },
};

/**
 * Runtime configuration override (useful for A/B testing or feature toggles)
 */
export class RuntimeConfig {
  private overrides: Partial<EnvironmentConfig> = {};

  setOverride<K extends keyof EnvironmentConfig>(
    key: K,
    value: Partial<EnvironmentConfig[K]>
  ): void {
    const existing = (this.overrides[key] || {}) as Record<string, any>;
    this.overrides[key] = { ...existing, ...value } as EnvironmentConfig[K];
  }

  getOverride<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] | undefined {
    return this.overrides[key];
  }

  clearOverrides(): void {
    this.overrides = {};
  }

  getEffectiveConfig(): EnvironmentConfig {
    return { ...envConfig, ...this.overrides };
  }
}

// Global runtime config instance
export const runtimeConfig = new RuntimeConfig();

/**
 * Build-time constants
 */
export const buildInfo = {
  version: process.env.BUILD_VERSION || '1.0.0',
  buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  commitHash: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'unknown',
  branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || 'unknown',
};