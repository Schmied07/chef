/**
 * Metrics collection and monitoring utilities
 */

import { logger } from './logger';

interface JobMetrics {
  jobId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'success' | 'failure';
  phase?: string;
  memoryUsed?: number;
  cpuUsed?: number;
}

class MetricsCollector {
  private jobs: Map<string, JobMetrics> = new Map();
  private counters: Map<string, number> = new Map();

  /**
   * Start tracking a job
   */
  startJob(jobId: string): void {
    this.jobs.set(jobId, {
      jobId,
      startTime: Date.now(),
      status: 'success',
    });
    this.incrementCounter('jobs_started');
  }

  /**
   * Complete a job
   */
  completeJob(jobId: string, status: 'success' | 'failure'): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.endTime = Date.now();
      job.duration = job.endTime - job.startTime;
      job.status = status;

      this.incrementCounter(`jobs_${status}`);
      logger.info(`Job ${jobId} completed in ${job.duration}ms with status ${status}`);
    }
  }

  /**
   * Update job phase
   */
  updatePhase(jobId: string, phase: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.phase = phase;
      this.incrementCounter(`phase_${phase}`);
    }
  }

  /**
   * Record resource usage
   */
  recordResourceUsage(jobId: string, memory?: number, cpu?: number): void {
    const job = this.jobs.get(jobId);
    if (job) {
      if (memory) job.memoryUsed = memory;
      if (cpu) job.cpuUsed = cpu;
    }
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  /**
   * Get job metrics
   */
  getJobMetrics(jobId: string): JobMetrics | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return {
      jobs: Array.from(this.jobs.values()),
      counters: Object.fromEntries(this.counters),
      summary: this.getSummary(),
    };
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const jobs = Array.from(this.jobs.values());
    const completed = jobs.filter((j) => j.endTime);
    const successful = completed.filter((j) => j.status === 'success');
    const failed = completed.filter((j) => j.status === 'failure');

    const avgDuration =
      completed.length > 0
        ? completed.reduce((sum, j) => sum + (j.duration || 0), 0) / completed.length
        : 0;

    return {
      total: jobs.length,
      completed: completed.length,
      successful: successful.length,
      failed: failed.length,
      inProgress: jobs.length - completed.length,
      successRate: completed.length > 0 ? (successful.length / completed.length) * 100 : 0,
      avgDuration: Math.round(avgDuration),
    };
  }

  /**
   * Clear old metrics (optional cleanup)
   */
  cleanup(maxAge: number = 3600000): void {
    const cutoff = Date.now() - maxAge;
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.endTime && job.endTime < cutoff) {
        this.jobs.delete(jobId);
      }
    }
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Auto cleanup every hour
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    metrics.cleanup();
  }, 3600000);
}
