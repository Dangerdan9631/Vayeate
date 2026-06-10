import { singleton } from 'tsyringe';
import type { KeyboardShortcutEvent } from '../../../../domain/operations/app-operations/types';
import { RedoOperation } from '../../../../domain/operations/undo-operations/redo-operation';
import { UndoOperation } from '../../../../domain/operations/undo-operations/undo-operation';

@singleton()
export class HandleKeyboardShortcutController {
  constructor(
    private readonly performUndo: UndoOperation,
    private readonly performRedo: RedoOperation,
  ) {}

  async run(e: KeyboardShortcutEvent): Promise<void> {
    if (!(e.ctrlKey || e.metaKey)) return;

    if (e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        await this.performRedo.execute();
      } else {
        await this.performUndo.execute();
      }
      return;
    }

    if (e.key === 'y') {
      e.preventDefault();
      await this.performRedo.execute();
    }
  }
}
