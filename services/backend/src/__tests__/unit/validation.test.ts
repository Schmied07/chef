/**
 * Unit tests for validation middleware
 */

import { describe, it, expect, vi } from 'vitest';
import { validate, validateBody, validateParams, validateQuery } from '../../middleware/validation';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

describe('Validation Middleware', () => {
  const mockRequest = (data: any, target: 'body' | 'params' | 'query' = 'body') => {
    return {
      [target]: data,
      path: '/test',
    } as unknown as Request;
  };

  const mockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = vi.fn();

  it('should validate valid body data', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const req = mockRequest({ name: 'John', age: 30 });
    const res = mockResponse();
    const middleware = validateBody(schema);

    await middleware(req, res, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject invalid body data', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const req = mockRequest({ name: 'John', age: 'invalid' });
    const res = mockResponse();
    const middleware = validateBody(schema);

    await middleware(req, res, mockNext as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.any(Array),
      })
    );
  });

  it('should validate query params', async () => {
    const schema = z.object({
      page: z.coerce.number(),
    });

    const req = mockRequest({ page: '1' }, 'query');
    const res = mockResponse();
    const middleware = validateQuery(schema);

    await middleware(req, res, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalled();
    expect(req.query).toEqual({ page: 1 });
  });

  it('should validate URL params', async () => {
    const schema = z.object({
      id: z.string().uuid(),
    });

    const req = mockRequest(
      { id: '123e4567-e89b-12d3-a456-426614174000' },
      'params'
    );
    const res = mockResponse();
    const middleware = validateParams(schema);

    await middleware(req, res, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalled();
  });
});
