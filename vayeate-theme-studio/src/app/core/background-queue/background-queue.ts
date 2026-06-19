import { delay, inject, singleton } from 'tsyringe';
import { BackgroundQueuePort } from '../../../domain/operations/background-queue/background-queue-port';
import type {
  BackgroundQueueContinuation,
  BackgroundQueueEnqueueOptions,
  BackgroundQueueKey,
} from '../../../model/background-queue';
import { DataIoBackgroundQueue } from './data-io-background-queue';
import { MainBackgroundQueue } from './main-background-queue';
import { DeferredBackgroundQueue } from './deferred-background-queue';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

/**
 * Facade that routes background work to the `main`, `deferred`, or `data_io` queue implementation.
 */
@singleton()
export class BackgroundQueue extends BackgroundQueuePort {
  private readonly log: Logger;

  constructor(
    @inject(delay(() => MainBackgroundQueue))
    private readonly mainQueue: MainBackgroundQueue,
    @inject(delay(() => DeferredBackgroundQueue))
    private readonly deferredQueue: DeferredBackgroundQueue,
    @inject(delay(() => DataIoBackgroundQueue))
    private readonly dataIoQueue: DataIoBackgroundQueue,
    loggerFactory: LoggerFactory,
  ) {
    super();
    this.log = loggerFactory.create('BackgroundQueue');
  }

  enqueue(
    queue: BackgroundQueueKey,
    description: string,
    run: () => void | Promise<void>,
    options?: BackgroundQueueEnqueueOptions,
  ): BackgroundQueueContinuation {
    switch (queue) {
      case 'main':
        return this.mainQueue.enqueue(description, run, options);
      case 'deferred':
        return this.deferredQueue.enqueue(description, run, options);
      case 'data_io':
        return this.dataIoQueue.enqueue(description, run, options);
      default: {
        const _exhaustive: never = queue;
        this.log.error('Unhandled background queue type', { queueType: _exhaustive });
        throw new Error(`Unhandled background queue type: ${String(queue)}`);
      }
    }
  }
}
