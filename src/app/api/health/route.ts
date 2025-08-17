/**
 * Health check endpoint for production monitoring
 * Provides system status and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { envConfig } from '@/lib/config/environment';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  checks: {
    database?: boolean;
    cdn?: boolean;
    analytics?: boolean;
  };
}

/**
 * Get memory usage information
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  const total = usage.heapTotal;
  const used = usage.heapUsed;
  
  return {
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round((used / total) * 100)
  };
}

/**
 * Check CDN connectivity
 */
async function checkCDN(): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_CDN_URL) {
    return true; // CDN not configured, skip check
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_CDN_URL}/health`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check analytics service
 */
async function checkAnalytics(): Promise<boolean> {
  if (!envConfig.analytics.enabled) {
    return true; // Analytics disabled, skip check
  }

  try {
    // Simple check - in production, you'd check actual analytics service
    return true;
  } catch {
    return false;
  }
}

/**
 * Determine overall health status
 */
function determineHealthStatus(checks: HealthStatus['checks'], memory: HealthStatus['memory']): HealthStatus['status'] {
  // Check if any critical services are down
  const criticalChecks = Object.values(checks);
  const hasFailedChecks = criticalChecks.some(check => check === false);
  
  // Check memory usage
  const highMemoryUsage = memory.percentage > 90;
  
  if (hasFailedChecks || highMemoryUsage) {
    return 'unhealthy';
  }
  
  // Check for degraded performance
  const moderateMemoryUsage = memory.percentage > 70;
  
  if (moderateMemoryUsage) {
    return 'degraded';
  }
  
  return 'healthy';
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Run health checks
    const [cdnStatus, analyticsStatus] = await Promise.all([
      checkCDN(),
      checkAnalytics()
    ]);
    
    const memory = getMemoryUsage();
    const checks = {
      cdn: cdnStatus,
      analytics: analyticsStatus
    };
    
    const status = determineHealthStatus(checks, memory);
    
    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.BUILD_VERSION || '1.0.0',
      environment: envConfig.environment,
      uptime: process.uptime(),
      memory,
      checks
    };
    
    const responseTime = Date.now() - startTime;
    
    // Set appropriate HTTP status code
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
        'X-Health-Status': status
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        version: process.env.BUILD_VERSION || '1.0.0',
        environment: envConfig.environment
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Status': 'unhealthy'
        }
      }
    );
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    const memory = getMemoryUsage();
    const status = memory.percentage > 90 ? 'unhealthy' : 'healthy';
    
    return new NextResponse(null, {
      status: status === 'healthy' ? 200 : 503,
      headers: {
        'X-Health-Status': status,
        'X-Memory-Usage': `${memory.percentage}%`
      }
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy'
      }
    });
  }
}