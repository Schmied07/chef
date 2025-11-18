/**
 * Projects API routes
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { createProject, getProjectStatus, getProjectLogs } from '../controllers/projects';
import { publishProject } from '../controllers/publish';

const router = Router();

// POST /v1/projects - Create a new project
router.post('/', createProject);

// GET /v1/projects/:id/status - Get project status
router.get('/:id/status', getProjectStatus);

// GET /v1/projects/:id/logs - Get project logs
router.get('/:id/logs', getProjectLogs);

// POST /v1/projects/:id/publish - Publish project
router.post('/:id/publish', publishProject);

export { router as projectsRouter };
