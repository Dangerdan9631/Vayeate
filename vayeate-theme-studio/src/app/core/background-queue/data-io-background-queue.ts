import { singleton } from 'tsyringe';
import { EnqueueBackgroundQueueActionOperation } from '../../../domain/operations/background-queue/enqueue-background-queue-action-operation';
import { LoggerFactory } from '../../../domain/utils/logger';
import { SignalBackgroundQueueProcessingCompleteController } from './controllers/signal-background-queue-processing-complete-controller';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import {
  DEFAULT_DATA_IO_READ_CONCURRENCY_LIMIT,
  KeyedDataIoQueue,
} from './keyed-data-io-queue';

/**
 * `data_io` background queue with keyed read/write lanes and a global serial fallback.
 */
@singleton()
export class DataIoBackgroundQueue extends KeyedDataIoQueue {
  constructor(
    enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
    updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    super(
      'data_io',
      DEFAULT_DATA_IO_READ_CONCURRENCY_LIMIT,
      enqueueBackgroundQueue,
      updateBackgroundQueueStatus,
      signalBackgroundQueueProcessingComplete,
      loggerFactory,
    );
  }
}
