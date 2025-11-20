/**
 * Queue monitoring routes
 */

import { Router } from 'express';
import {
  getQueueStatistics,
  getDeadLetterQueueJobs,
  retryDeadLetterJobController,
  clearDeadLetterQueueController,
} from '../controllers/queue';

const router = Router();

// GET /v1/queue/stats - Get queue statistics
router.get('/stats', getQueueStatistics);

// GET /v1/queue/dead-letter - Get dead letter queue jobs
router.get('/dead-letter', getDeadLetterQueueJobs);

// POST /v1/queue/dead-letter/:jobId/retry - Retry a job from DLQ
router.post('/dead-letter/:jobId/retry', retryDeadLetterJobController);

// DELETE /v1/queue/dead-letter - Clear dead letter queue
router.delete('/dead-letter', clearDeadLetterQueueController);

export { router as queueRouter };
