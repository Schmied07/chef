/**
 * Artifacts routes
 */

import { Router } from 'express';
import { getArtifacts, downloadArtifact, deleteArtifacts } from '../controllers/artifacts';

const router = Router();

// GET /v1/projects/:projectId/artifacts - List all artifacts
router.get('/:projectId/artifacts', getArtifacts);

// GET /v1/projects/:projectId/artifacts/:filename - Download specific artifact
router.get('/:projectId/artifacts/:filename', downloadArtifact);

// DELETE /v1/projects/:projectId/artifacts - Delete all artifacts
router.delete('/:projectId/artifacts', deleteArtifacts);

export { router as artifactsRouter };