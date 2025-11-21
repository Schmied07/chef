/**
 * AI Generation routes
 */

import { Router } from 'express';
import { generateProject } from '../controllers/generate';
import { validateBody } from '../middleware/validation';
import { sanitizeBody } from '../middleware/sanitization';
import { generateProjectSchema } from '../schemas';

const router = Router();

// POST /v1/generate - Generate project from prompt
router.post('/', sanitizeBody, validateBody(generateProjectSchema), generateProject);

export { router as generateRouter };
