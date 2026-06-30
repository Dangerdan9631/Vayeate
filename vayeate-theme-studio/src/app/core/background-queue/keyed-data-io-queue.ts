import { Semaphore } from 'async-mutex';
import { injectable } from 'tsyringe';
import { EnqueueBackgroundQueueActionOperation } from '../../../domain/operations/background-queue/enqueue-background-queue-action-operation';
import { type Logger, LoggerFactory } from '../../../domain/utils/logger';
import type {
  BackgroundQueueContinuation,
  BackgroundQueueEnqueueOptions,
  BackgroundQueueKey,
  DataIoAccessMode,
} from '../../../model/background-queue';
import { BackgroundQueueResolver } from './background-queue-resolver';
import { SignalBackgroundQueueProcessingCompleteController } from './controllers/signal-background-queue-processing-complete-controller';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import { IBackgroundQueue } from './ibackground-queue';
import { QueuedWork } from './queued-work';

/**
 * Maximum number of concurrent keyed read operations across all keys.
 */
export const DEFAULT_DATA_IO_READ_CONCURRENCY_LIMIT = 16;

interface KeyLaneItem {
  access: DataIoAccessMode;
  work: QueuedWork;
}

/**
 * Keyed data I/O queue: serial per key for writes, pooled reads, and a global serial lane when no key is supplied.
 */
@injectable()
export class KeyedDataIoQueue implements IBackgroundQueue {
  private readonly log: Logger;
  private readonly globalSerialQueue: QueuedWork[] = [];
  private readonly keyLanes = new Map<string, KeyLaneItem[]>();
  private readonly keyDraining = new Set<string>();
  private readonly readSemaphore: Semaphore;

  private globalSerialProcessing = false;
  private inFlightCount = 0;
  private pendingKeyedCount = 0;
  private runningDescriptions: string[] = [];

  constructor(
    private readonly queueType: BackgroundQueueKey,
    readConcurrencyLimit: number,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
    private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    private readonly signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(`BackgroundQueue[${queueType}]`);
    this.readSemaphore = new Semaphore(readConcurrencyLimit);
  }

  enqueue(
    description: string,
    run: () => void | Promise<void>,
    options?: BackgroundQueueEnqueueOptions,
  ): BackgroundQueueContinuation {
    const item: QueuedWork = {
      description,
      run,
      resolver: new BackgroundQueueResolver(description),
    };

    if (!options?.key) {
      this.log.debug('enqueue (serial):', description);
      this.globalSerialQueue.push(item);
      void this.processGlobalSerial();
      return item.resolver;
    }

    if (!options.access) {
      throw new Error(`data_io keyed enqueue requires access for key "${options.key}"`);
    }

    this.log.debug('enqueue (keyed):', description, options.key, options.access);
    this.enqueueKeyed(options.key, options.access, item);
    return item.resolver;
  }

  private enqueueKeyed(key: string, access: DataIoAccessMode, item: QueuedWork): void {
    let lane = this.keyLanes.get(key);
    if (!lane) {
      lane = [];
      this.keyLanes.set(key, lane);
    }
    lane.push({ access, work: item });
    this.pendingKeyedCount += 1;
    this.updateStatus();
    void this.drainKey(key);
  }

  private async processGlobalSerial(): Promise<void> {
    if (this.globalSerialProcessing) return;
    this.globalSerialProcessing = true;

    while (this.globalSerialQueue.length > 0) {
      const item = this.globalSerialQueue.shift()!;
      await this.runWork(item);
    }

    this.globalSerialProcessing = false;
    this.trySignalComplete();
  }

  private async drainKey(key: string): Promise<void> {
    if (this.keyDraining.has(key)) return;
    this.keyDraining.add(key);

    try {
      while (true) {
        const lane = this.keyLanes.get(key);
        if (!lane || lane.length === 0) {
          this.keyLanes.delete(key);
          break;
        }

        const readBatch: QueuedWork[] = [];
        while (lane.length > 0 && lane[0].access === 'read') {
          readBatch.push(lane.shift()!.work);
          this.pendingKeyedCount -= 1;
        }

        if (readBatch.length > 0) {
          await Promise.all(readBatch.map((work) => this.runKeyedRead(work)));
          continue;
        }

        if (lane.length > 0 && lane[0].access === 'write') {
          const writeItem = lane.shift()!.work;
          this.pendingKeyedCount -= 1;
          await this.runKeyedWrite(writeItem);
        }
      }
    } finally {
      this.keyDraining.delete(key);
      this.trySignalComplete();
    }
  }

  private async runKeyedRead(item: QueuedWork): Promise<void> {
    await this.readSemaphore.acquire(1);
    try {
      await this.runWork(item);
    } finally {
      this.readSemaphore.release(1);
    }
  }

  private async runKeyedWrite(item: QueuedWork): Promise<void> {
    await this.runWork(item);
  }

  private async runWork(item: QueuedWork): Promise<void> {
    this.inFlightCount += 1;
    this.runningDescriptions.push(item.description);
    this.updateStatus();

    try {
      await item.run();
    } catch (err) {
      this.log.error('Error running background work:', err);
    } finally {
      try {
        item.resolver.onResolve(this.queueType, this.enqueueBackgroundQueue);
      } catch (err) {
        this.log.error('Error resolving background work:', err);
      } finally {
        this.inFlightCount -= 1;
        const index = this.runningDescriptions.indexOf(item.description);
        if (index >= 0) {
          this.runningDescriptions.splice(index, 1);
        }
        this.updateStatus();
      }
    }
  }

  private updateStatus(): void {
    const pending =
      this.globalSerialQueue.length
      + this.pendingKeyedCount
      + this.inFlightCount;
    this.updateBackgroundQueueStatus.run(
      this.queueType,
      [...this.runningDescriptions],
      pending,
    );
  }

  private trySignalComplete(): void {
    const hasPendingKeyed = this.pendingKeyedCount > 0 || this.keyLanes.size > 0 || this.keyDraining.size > 0;
    if (
      this.globalSerialQueue.length === 0
      && !this.globalSerialProcessing
      && !hasPendingKeyed
      && this.inFlightCount === 0
    ) {
      this.signalBackgroundQueueProcessingComplete.run(this.queueType);
    }
  }
}
