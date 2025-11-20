/**
 * Docker service for container management
 */

import Docker from 'dockerode';
import { config } from '../config';
import { logger } from '../utils/logger';
import type { BuildStrategy } from '../types/job';

let dockerClient: Docker | null = null;

export function getDockerClient(): Docker {
  if (!dockerClient) {
    dockerClient = new Docker({
      socketPath: config.docker.host.replace('unix://', ''),
    });
  }
  return dockerClient;
}

/**
 * Get Docker image for build strategy
 */
export function getDockerImage(strategy: BuildStrategy): string {
  switch (strategy.runtime) {
    case 'node':
      return `node:${strategy.version || '18'}-alpine`;
    case 'python':
      return `python:${strategy.version || '3.11'}-slim`;
    case 'web':
      return 'nginx:alpine';
    default:
      return 'node:18-alpine';
  }
}

/**
 * Pull Docker image if not exists
 */
export async function ensureImage(imageName: string): Promise<void> {
  const docker = getDockerClient();

  try {
    await docker.getImage(imageName).inspect();
    logger.info(`Image ${imageName} already exists`);
  } catch (error) {
    logger.info(`Pulling image ${imageName}...`);
    await new Promise((resolve, reject) => {
      docker.pull(imageName, (err: any, stream: any) => {
        if (err) return reject(err);

        docker.modem.followProgress(stream, (err: any, output: any) => {
          if (err) return reject(err);
          resolve(output);
        });
      });
    });
    logger.info(`Image ${imageName} pulled successfully`);
  }
}

/**
 * Create and run container with resource limits
 */
export async function createContainer(options: {
  image: string;
  cmd: string[];
  binds: string[];
  env?: string[];
  workingDir?: string;
}): Promise<Docker.Container> {
  const docker = getDockerClient();

  const container = await docker.createContainer({
    Image: options.image,
    Cmd: options.cmd,
    WorkingDir: options.workingDir || '/workspace',
    Env: options.env || [],
    HostConfig: {
      Binds: options.binds,
      Memory: parseMemoryLimit(config.docker.memoryLimit),
      NanoCpus: config.docker.cpuLimit * 1e9,
      AutoRemove: true,
      NetworkMode: 'none', // Disable network access for security
    },
    AttachStdout: true,
    AttachStderr: true,
  });

  return container;
}

/**
 * Execute command in container and capture output
 */
export async function executeInContainer(
  container: Docker.Container,
  onLog: (log: { timestamp: string; level: string; message: string; source: string }) => void
): Promise<{ exitCode: number; output: string }> {
  const startTime = Date.now();
  let output = '';

  try {
    await container.start();

    // Attach to container logs
    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: true,
    });

    stream.on('data', (chunk: Buffer) => {
      const message = chunk.toString('utf8');
      output += message;
      onLog({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: message.trim(),
        source: 'stdout',
      });
    });

    // Wait for container to finish
    const result = await container.wait();

    return {
      exitCode: result.StatusCode,
      output,
    };
  } catch (error) {
    onLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `Container execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'system',
    });
    throw error;
  }
}

/**
 * Kill container with timeout
 */
export async function killContainer(containerId: string, timeout: number = 10): Promise<void> {
  const docker = getDockerClient();

  try {
    const container = docker.getContainer(containerId);
    await container.stop({ t: timeout });
    logger.info(`Container ${containerId} stopped`);
  } catch (error) {
    logger.error(`Failed to stop container ${containerId}:`, error);
  }
}

/**
 * Check Docker health
 */
export async function checkDockerHealth(): Promise<boolean> {
  try {
    const docker = getDockerClient();
    await docker.ping();
    return true;
  } catch (error) {
    logger.error('Docker health check failed:', error);
    return false;
  }
}

// Helper functions
function parseMemoryLimit(limit: string): number {
  const units: Record<string, number> = {
    k: 1024,
    m: 1024 * 1024,
    g: 1024 * 1024 * 1024,
  };

  const match = limit.match(/^(\d+)([kmg])?$/i);
  if (!match) return 512 * 1024 * 1024; // Default 512MB

  const value = parseInt(match[1]);
  const unit = match[2]?.toLowerCase() || 'm';

  return value * (units[unit] || units.m);
}