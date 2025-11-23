/**
 * Unit tests for input sanitization
 */

import { describe, it, expect, vi } from 'vitest';
import { sanitizeInputs, sanitizeFilePath, validateUrl } from '../../middleware/sanitizer';
import type { Request, Response, NextFunction } from 'express';

describe('Sanitizer Middleware', () => {
  const mockRequest = (data: any) => {
    return {
      body: data.body || {},
      query: data.query || {},
      params: data.params || {},
    } as Request;
  };

  const mockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = vi.fn();

  it('should sanitize XSS attempts in body', () => {
    const req = mockRequest({
      body: {
        name: '<script>alert("XSS")</script>',
        description: 'Normal text',
      },
    });
    const res = mockResponse();
    const middleware = sanitizeInputs();

    middleware(req, res, mockNext as NextFunction);

    expect(req.body.name).not.toContain('<script>');
    expect(req.body.name).toContain('&lt;');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should remove null bytes', () => {
    const req = mockRequest({
      body: {
        text: 'hello\x00world',
      },
    });
    const res = mockResponse();
    const middleware = sanitizeInputs();

    middleware(req, res, mockNext as NextFunction);

    expect(req.body.text).not.toContain('\x00');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should prevent prototype pollution', () => {
    const req = mockRequest({
      body: {
        __proto__: { polluted: true },
        constructor: { polluted: true },
        safeProperty: 'safe value',
      },
    });
    const res = mockResponse();
    const middleware = sanitizeInputs();

    middleware(req, res, mockNext as NextFunction);

    // Dangerous keys should not be present in sanitized object
    expect(Object.keys(req.body)).not.toContain('__proto__');
    expect(Object.keys(req.body)).not.toContain('constructor');
    expect(Object.keys(req.body)).not.toContain('prototype');
    // Safe properties should be preserved
    expect(req.body.safeProperty).toBe('safe value');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should sanitize nested objects', () => {
    const req = mockRequest({
      body: {
        user: {
          name: '<img src=x onerror=alert(1)>',
          profile: {
            bio: '<script>alert(1)</script>',
          },
        },
      },
    });
    const res = mockResponse();
    const middleware = sanitizeInputs();

    middleware(req, res, mockNext as NextFunction);

    expect(req.body.user.name).not.toContain('<img');
    expect(req.body.user.profile.bio).not.toContain('<script>');
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('sanitizeFilePath', () => {
  it('should prevent path traversal', () => {
    expect(() => sanitizeFilePath('../etc/passwd')).not.toThrow();
    expect(sanitizeFilePath('../etc/passwd')).not.toContain('..');
  });

  it('should remove leading slashes', () => {
    const result = sanitizeFilePath('/root/file.txt');
    expect(result).not.toMatch(/^\//);
  });

  it('should reject absolute paths', () => {
    expect(() => sanitizeFilePath('C:\\Windows\\System32')).toThrow();
  });

  it('should allow safe relative paths', () => {
    expect(() => sanitizeFilePath('src/index.ts')).not.toThrow();
    expect(sanitizeFilePath('src/index.ts')).toBe('src/index.ts');
  });
});

describe('validateUrl', () => {
  it('should accept valid HTTPS URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
  });

  it('should reject localhost URLs', () => {
    expect(validateUrl('http://localhost:3000')).toBe(false);
  });

  it('should reject private IP ranges', () => {
    expect(validateUrl('http://192.168.1.1')).toBe(false);
    expect(validateUrl('http://10.0.0.1')).toBe(false);
    expect(validateUrl('http://172.16.0.1')).toBe(false);
  });

  it('should reject non-HTTP protocols', () => {
    expect(validateUrl('ftp://example.com')).toBe(false);
    expect(validateUrl('file:///etc/passwd')).toBe(false);
  });
});
