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
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];
    
    // Help and type declarations
    lines.push('# HELP chef_jobs_started_total Total number of jobs started');
    lines.push('# TYPE chef_jobs_started_total counter');
    lines.push(`chef_jobs_started_total ${this.counters.get('jobs_started') || 0}`);
    
    lines.push('# HELP chef_jobs_success_total Total number of successful jobs');
    lines.push('# TYPE chef_jobs_success_total counter');
    lines.push(`chef_jobs_success_total ${this.counters.get('jobs_success') || 0}`);
    
    lines.push('# HELP chef_jobs_failure_total Total number of failed jobs');
    lines.push('# TYPE chef_jobs_failure_total counter');
    lines.push(`chef_jobs_failure_total ${this.counters.get('jobs_failure') || 0}`);
    
    const summary = this.getSummary();
    lines.push('# HELP chef_jobs_in_progress Current number of jobs in progress');
    lines.push('# TYPE chef_jobs_in_progress gauge');
    lines.push(`chef_jobs_in_progress ${summary.inProgress}`);
    
    lines.push('# HELP chef_jobs_success_rate Job success rate percentage');
    lines.push('# TYPE chef_jobs_success_rate gauge');
    lines.push(`chef_jobs_success_rate ${summary.successRate.toFixed(2)}`);
    
    lines.push('# HELP chef_jobs_avg_duration_ms Average job duration in milliseconds');
    lines.push('# TYPE chef_jobs_avg_duration_ms gauge');
    lines.push(`chef_jobs_avg_duration_ms ${summary.avgDuration}`);
    
    // Phase counters
    for (const [key, value] of this.counters.entries()) {
      if (key.startsWith('phase_')) {
        const phase = key.replace('phase_', '');
        lines.push(`# HELP chef_phase_${phase}_total Total number of times phase ${phase} was executed`);
        lines.push(`# TYPE chef_phase_${phase}_total counter`);
        lines.push(`chef_phase_${phase}_total ${value}`);
      }
    }
    
    return lines.join('\n') + '\n';
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
