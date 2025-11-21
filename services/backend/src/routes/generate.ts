/**
 * AI Generation routes
 */

import { Router } from 'express';
import { generateProject } from '../controllers/generate';
import { validateBody } from '../middleware/validation';
import { generateRateLimiter } from '../middleware/rate-limit';
import { generateProjectSchema } from '../schemas/generate';

const router = Router();

// POST /v1/generate - Generate project from prompt
router.post(
  '/',
  generateRateLimiter,
  sanitizeBody,
  validateBody(generateProjectSchema),
  generateProject
);

export { router as generateRouter };
