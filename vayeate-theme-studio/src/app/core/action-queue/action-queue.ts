import type { AppAction } from './app-action';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { yieldToEventLoop } from '../../../domain/core/scheduler';
import { ActionProcessor } from './action-processor';
import { singleton } from 'tsyringe';
import { UpdateActionQueueStatusController } from './controllers/update-action-queue-status-controller';
import { SignalActionQueueProcessingCompleteController } from './controllers/signal-action-queue-processing-complete-controller';
import { tryCoalesce } from './action-coalescing-policy';
import { getActionPriority, type ActionPriority } from './action-priority-policy';

const ACTION_BUDGET_MS = 8;

function describeAction(action: AppAction): string {
  return action.type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Minimal contract for enqueueing UI-originated actions into the renderer pipeline.
 */
export interface IActionQueue {
  /**
   * Adds an action to the queue and starts processing when idle.
   */
  enqueue(action: AppAction): void;
}

/**
 * Serial cooperative queue for `AppAction` signals from the renderer.
 * Coalesces compatible pending actions before appending, routes each item through
 * `ActionProcessor`, drains an interactive lane before normal work, and yields
 * to the event loop after actions that exceed a frame budget.
 */
@singleton()
export class ActionQueue implements IActionQueue {
  private interactive: AppAction[] = [];
  private normal: AppAction[] = [];
  private isProcessing = false;
  private readonly log: Logger;

  constructor(
    private readonly actionProcessor: ActionProcessor,
    private readonly updateActionQueueStatus: UpdateActionQueueStatusController,
    private readonly signalActionQueueProcessingComplete: SignalActionQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('ActionQueue');
  }

  enqueue(action: AppAction): void {
    const priority = getActionPriority(action);
    const queue = this.getQueue(priority);

    // Scan backwards through pending actions in this lane: if a coalescing policy matches,
    // merge into the most-recent matching entry instead of appending.
    // The currently-processing action (already shifted out) is never touched,
    // preserving at-least-once delivery of the final value.
    for (let i = queue.length - 1; i >= 0; i--) {
      const pending = queue[i];
      if (pending.type !== action.type) continue;
      const merged = tryCoalesce(pending, action);
      if (merged !== null) {
        queue[i] = merged;
        void this.process();
        return;
      }
    }
    queue.push(action);
    void this.process();
  }

  private getQueue(priority: ActionPriority): AppAction[] {
    return priority === 'interactive' ? this.interactive : this.normal;
  }

  private get pendingCount(): number {
    return this.interactive.length + this.normal.length;
  }

  private dequeueNext(): AppAction | undefined {
    if (this.interactive.length > 0) {
      return this.interactive.shift();
    }
    if (this.normal.length > 0) {
      return this.normal.shift();
    }
    return undefined;
  }

  private async process(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.pendingCount > 0) {
      const action = this.dequeueNext();
      if (!action) break;

      this.updateActionQueueStatus.run(this.pendingCount + 1, describeAction(action));
      const startedAt = performance.now();
      try {
        await this.actionProcessor.process(action);
      } catch (err) {
        this.log.error('Error processing action:', action.type, err);
      }

      if (performance.now() - startedAt > ACTION_BUDGET_MS && this.pendingCount > 0) {
        await yieldToEventLoop();
      }
    }

    this.signalActionQueueProcessingComplete.run();
    this.isProcessing = false;
  }
}
