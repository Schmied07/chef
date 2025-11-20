/**
 * Artifacts routes
 */

import { Router } from 'express';
import { getArtifacts, downloadArtifact } from '../controllers/artifacts';

const router = Router();

// GET /v1/projects/:id/artifacts - List artifacts
router.get('/:id/artifacts', getArtifacts);

// GET /v1/projects/:id/artifacts/:name - Download artifact
router.get('/:id/artifacts/:name', downloadArtifact);

export { router as artifactsRouter };