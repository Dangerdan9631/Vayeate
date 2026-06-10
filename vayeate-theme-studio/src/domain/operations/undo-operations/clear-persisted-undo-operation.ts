import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../model/background-queue';
import { UndoPersistencePort } from './undo-persistence-port';

@singleton()
export class ClearPersistedUndoOperation {
  constructor(
    private readonly undoPersistence: UndoPersistencePort,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  async executeNow(): Promise<void> {
    undoManagerV2.configure({
      persistence: this.undoPersistence,
      persistEnqueue: (description, run) => {
        this.enqueueBackgroundAction.execute('data_io', description, run);
      },
    });
    await undoManagerV2.clearPersisted();
  }

  execute(): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'data_io',
      'Clearing persisted undo',
      async () => {
        await this.executeNow();
      }
    );
  }
}
