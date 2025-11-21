/**
 * Projects API routes
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { createProject, getProjectStatus, getProjectLogs } from '../controllers/projects';
import { publishProject } from '../controllers/publish';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { sanitizeBody } from '../middleware/sanitization';
import {
  createProjectSchema,
  getProjectParamsSchema,
  projectStatusQuerySchema,
} from '../schemas';

const router = Router();

// POST /v1/projects - Create a new project
router.post('/', sanitizeBody, validateBody(createProjectSchema), createProject);

// GET /v1/projects/:id/status - Get project status
router.get(
  '/:id/status',
  validateParams(getProjectParamsSchema),
  validateQuery(projectStatusQuerySchema),
  getProjectStatus
);

// GET /v1/projects/:id/logs - Get project logs
router.get('/:id/logs', validateParams(getProjectParamsSchema), getProjectLogs);

// POST /v1/projects/:id/publish - Publish project
router.post('/:id/publish', validateParams(getProjectParamsSchema), publishProject);

export { router as projectsRouter };
