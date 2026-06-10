import { Semaphore } from "async-mutex";
import { Logger, LoggerFactory } from "../../../domain/utils/logger";
import { BackgroundQueueResolver } from "./background-queue-resolver";
import { SignalBackgroundQueueProcessingCompleteController } from "./controllers/signal-background-queue-processing-complete-controller";
import { UpdateBackgroundQueueStatusController } from "./controllers/update-background-queue-status-controller";
import { IBackgroundQueue } from "./ibackground-queue";
import { QueuedWork } from "./queued-work";
import { EnqueueBackgroundQueueActionOperation } from "../../../domain/operations/background-queue/enqueue-background-queue-action-operation";
import { injectable } from "tsyringe";
import type {
    BackgroundQueueContinuation,
    BackgroundQueueEnqueueOptions,
    BackgroundQueueKey,
} from "../../../model/background-queue";

@injectable()
export class PooledQueue implements IBackgroundQueue {

    private queue: QueuedWork[] = [];
    private isProcessing = false;
    private runningDescriptions: { [key: string]: string } = {};
    private readonly semaphore = new Semaphore(this.concurrencyLimit);
    private pendingWakeup = false;
    private wakeupWaiters: Array<() => void> = [];

    private readonly log: Logger;

    constructor(
        private readonly queueType: BackgroundQueueKey,
        private readonly concurrencyLimit: number,
        private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
        private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
        private readonly signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
        loggerFactory: LoggerFactory,
    ) {
        this.log = loggerFactory.create(`BackgroundQueue[${queueType}]`);
    }

    enqueue(
        description: string,
        run: () => void | Promise<void>,
        _options?: BackgroundQueueEnqueueOptions,
    ): BackgroundQueueContinuation {
        const item: QueuedWork = { description, run, resolver: new BackgroundQueueResolver(description) };
        this.queue.push(item);
        this.signalWakeup();
        void this.process();
        return item.resolver;
    }

    private async process(): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0 || this.semaphore.getValue() < this.concurrencyLimit) {
            if (this.queue.length > 0) {
                await this.semaphore.acquire(1);
                const item = this.queue.shift()!;
                void this.runWorker(item);
            } else {
                await this.waitForWakeup();
            }
        }

        this.isProcessing = false;
        this.signalBackgroundQueueProcessingComplete.run(this.queueType);
    }

    private async runWorker(item: QueuedWork): Promise<void> {
        const workerId = crypto.randomUUID();
        this.runningDescriptions[workerId] = item.description;

        this.updateBackgroundQueueStatus.run(
            this.queueType,
            Object.values(this.runningDescriptions),
            this.queue.length + (this.concurrencyLimit - this.semaphore.getValue())
        );
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
                this.semaphore.release(1);
                delete this.runningDescriptions[workerId];
                this.updateBackgroundQueueStatus.run(
                    this.queueType,
                    Object.values(this.runningDescriptions),
                    this.queue.length + (this.concurrencyLimit - this.semaphore.getValue())
                );
                this.signalWakeup();
            }
        }
    }

    private signalWakeup(): void {
        const waiters = this.wakeupWaiters.splice(0);
        if (waiters.length > 0) {
            for (const resolve of waiters) {
                resolve();
            }
        } else {
            this.pendingWakeup = true;
        }
    }

    private waitForWakeup(): Promise<void> {
        if (this.pendingWakeup) {
            this.pendingWakeup = false;
            return Promise.resolve();
        }
        return new Promise(resolve => {
            this.wakeupWaiters.push(resolve);
        });
    }
}
