import type { AppAction } from './action-types';
import type { AppStateUpdate } from '../state/app-state';

export type ActionProcessor = (
  action: AppAction,
  setState: (update: AppStateUpdate) => void
) => Promise<void>;

export class ActionQueue {
  private queue: AppAction[] = [];
  private processing = false;
  private processor: ActionProcessor;

  constructor(processor: ActionProcessor) {
    this.processor = processor;
  }

  enqueue(action: AppAction): void {
    this.queue.push(action);
    this.process();
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const action = this.queue.shift()!;
      const setState = (update: AppStateUpdate) => {
        this.onStateUpdate(update);
      };
      try {
        await this.processor(action, setState);
      } catch (err) {
        console.error('Action queue error:', err);
      }
    }

    this.processing = false;
  }

  onStateUpdate: (update: AppStateUpdate) => void = () => {};
}
