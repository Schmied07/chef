/**
 * Webhook routes for worker callbacks
 */

import { Router } from 'express';
import { handleWorkerResult } from '../controllers/hooks';

const router = Router();

// POST /v1/hooks/worker-result - Handle worker completion callback
router.post('/worker-result', handleWorkerResult);

export { router as hooksRouter };
