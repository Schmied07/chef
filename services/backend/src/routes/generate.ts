/**
 * AI Generation routes
 */

import { Router } from 'express';
import { generateProject } from '../controllers/generate';

const router = Router();

// POST /v1/generate - Generate project from prompt
router.post('/', generateProject);

export { router as generateRouter };
