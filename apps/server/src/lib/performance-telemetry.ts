/**
 * Performance Telemetry Hooks
 *
 * Provides utilities for measuring and logging performance metrics for critical operations.
 * Focus areas: search performance, load times, export generation.
 */
import type { LoggerFactory } from '@~/features/logger/logger.types';

export interface iPerformanceMetrics {
  operation: string;
  durationMs: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class PerformanceTelemetry {
  private logger: ReturnType<LoggerFactory['create']>;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('performance-telemetry');
  }

  /**
   * Measures the execution time of an async operation
   * @param operation Name of the operation being measured
   * @param fn Async function to measure
   * @param metadata Additional context for logging
   * @returns Result of the function execution
   */
  public async measure<T>(operation: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T> {
    const startTime = performance.now();
    const timestamp = new Date();

    try {
      const result = await fn();
      const durationMs = performance.now() - startTime;

      this.logMetric({
        operation,
        durationMs,
        timestamp,
        metadata: { ...metadata, status: 'success' },
      });

      return result;
    } catch (error) {
      const durationMs = performance.now() - startTime;

      this.logMetric({
        operation,
        durationMs,
        timestamp,
        metadata: { ...metadata, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      });

      throw error;
    }
  }

  /**
   * Measures synchronous operation time
   * @param operation Name of the operation
   * @param fn Function to measure
   * @param metadata Additional context
   * @returns Result of the function execution
   */
  public measureSync<T>(operation: string, fn: () => T, metadata?: Record<string, unknown>): T {
    const startTime = performance.now();
    const timestamp = new Date();

    try {
      const result = fn();
      const durationMs = performance.now() - startTime;

      this.logMetric({
        operation,
        durationMs,
        timestamp,
        metadata: { ...metadata, status: 'success' },
      });

      return result;
    } catch (error) {
      const durationMs = performance.now() - startTime;

      this.logMetric({
        operation,
        durationMs,
        timestamp,
        metadata: { ...metadata, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      });

      throw error;
    }
  }

  /**
   * Logs a performance metric with appropriate warning levels
   */
  private logMetric(metrics: iPerformanceMetrics) {
    const { operation, durationMs, metadata } = metrics;

    // Define performance thresholds (can be configurable)
    const thresholds = {
      search: 300, // 300ms for p95 search
      load: 2000, // 2s for series/script load
      export: 5000, // 5s for 120-page script export
    };

    const threshold = this.getThreshold(operation, thresholds);
    const isSlowOperation = durationMs > threshold;

    if (isSlowOperation) {
      this.logger.warn('Slow operation detected', {
        operation,
        durationMs: Math.round(durationMs),
        threshold,
        exceedsBy: Math.round(durationMs - threshold),
        ...metadata,
      });
    } else {
      this.logger.info('Operation completed', {
        operation,
        durationMs: Math.round(durationMs),
        ...metadata,
      });
    }
  }

  /**
   * Determines appropriate threshold for an operation
   */
  private getThreshold(operation: string, thresholds: Record<string, number>): number {
    const lowerOp = operation.toLowerCase();

    if (lowerOp.includes('search')) return thresholds.search;
    if (lowerOp.includes('load') || lowerOp.includes('get') || lowerOp.includes('list')) return thresholds.load;
    if (lowerOp.includes('export')) return thresholds.export;

    // Default threshold for other operations
    return 1000;
  }
}

/**
 * Factory function to create telemetry instance
 */
export function createPerformanceTelemetry(loggerFactory: LoggerFactory): PerformanceTelemetry {
  return new PerformanceTelemetry(loggerFactory);
}
