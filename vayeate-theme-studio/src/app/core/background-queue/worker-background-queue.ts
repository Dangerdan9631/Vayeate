import { singleton } from 'tsyringe';
import { EnqueueBackgroundQueueActionOperation } from '../../../domain/operations/background-queue/enqueue-background-queue-action-operation';
import { LoggerFactory } from '../../../domain/utils/logger';
import { SignalBackgroundQueueProcessingCompleteController } from './controllers/signal-background-queue-processing-complete-controller';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import { PooledQueue } from './pooled-queue';

/**
 * Maximum number of concurrent jobs on the `worker` background queue.
 */
export const DEFAULT_BACKGROUND_WORKER_CONCURRENCY_LIMIT = 16;

/**
 * Pooled `worker` background queue for CPU-bound or off-main-thread work.
 */
@singleton()
export class WorkerBackgroundQueue extends PooledQueue {
  constructor(
    enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
    updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    super(
      'worker',
      DEFAULT_BACKGROUND_WORKER_CONCURRENCY_LIMIT,
      enqueueBackgroundQueue,
      updateBackgroundQueueStatus,
      signalBackgroundQueueProcessingComplete,
      loggerFactory,
    );
  }
}
