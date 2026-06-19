import { singleton } from 'tsyringe';
import { EnqueueBackgroundQueueActionOperation } from '../../../domain/operations/background-queue/enqueue-background-queue-action-operation';
import { LoggerFactory } from '../../../domain/utils/logger';
import { SignalBackgroundQueueProcessingCompleteController } from './controllers/signal-background-queue-processing-complete-controller';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import { PooledQueue } from './pooled-queue';

/**
 * Maximum number of concurrent jobs on the `deferred` background queue.
 */
export const DEFAULT_BACKGROUND_DEFERRED_CONCURRENCY_LIMIT = 16;

/**
 * Pooled `deferred` background queue for main-thread work scheduled off the action queue.
 * This is not a Web Worker — jobs still run on the renderer thread.
 */
@singleton()
export class DeferredBackgroundQueue extends PooledQueue {
  constructor(
    enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
    updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    super(
      'deferred',
      DEFAULT_BACKGROUND_DEFERRED_CONCURRENCY_LIMIT,
      enqueueBackgroundQueue,
      updateBackgroundQueueStatus,
      signalBackgroundQueueProcessingComplete,
      loggerFactory,
    );
  }
}
