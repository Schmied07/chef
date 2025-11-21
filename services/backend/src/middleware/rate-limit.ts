/**
 * Rate limiting middleware
 */

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

/**
 * Global rate limiter
 * 100 requests per 15 minutes per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

/**
 * Strict rate limiter for AI generation endpoints
 * 5 requests per minute per IP
 */
export const generateRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn(`Generate rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many generation requests',
      message: 'Please wait before generating another project',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

/**
 * Rate limiter for build endpoints
 * 3 requests per minute per IP
 */
export const buildRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn(`Build rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many build requests',
      message: 'Please wait before starting another build',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

/**
 * Lenient rate limiter for read-only endpoints
 * 200 requests per 15 minutes per IP
 */
export const readRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn(`Read rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});
