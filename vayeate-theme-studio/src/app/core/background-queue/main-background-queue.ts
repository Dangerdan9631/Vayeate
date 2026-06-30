import { singleton } from 'tsyringe';
import { EnqueueBackgroundQueueActionOperation } from '../../../domain/operations/background-queue/enqueue-background-queue-action-operation';
import { LoggerFactory } from '../../../domain/utils/logger';
import { SignalBackgroundQueueProcessingCompleteController } from './controllers/signal-background-queue-processing-complete-controller';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import { SerialQueue } from './serial-queue';

/**
 * Serial `main` background queue for work that must not run concurrently on the renderer.
 */
@singleton()
export class MainBackgroundQueue extends SerialQueue {
  constructor(
    enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
    updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    super(
      'main',
      enqueueBackgroundQueue,
      updateBackgroundQueueStatus,
      signalBackgroundQueueProcessingComplete,
      loggerFactory,
    );
  }
}
