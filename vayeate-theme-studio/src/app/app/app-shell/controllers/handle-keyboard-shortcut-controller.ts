import { singleton } from 'tsyringe';
import { RedoOperation } from '../../../../domain/operations/undo-operations/redo-operation';
import { UndoOperation } from '../../../../domain/operations/undo-operations/undo-operation';

@singleton()
export class HandleKeyboardShortcutController {
  constructor(
    private readonly performUndo: UndoOperation,
    private readonly performRedo: RedoOperation,
  ) {}

  run(e: KeyboardEvent): void {
    if (!(e.ctrlKey || e.metaKey)) return;

    if (e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        void this.performRedo.execute();
      } else {
        void this.performUndo.execute();
      }
      return;
    }

    if (e.key === 'y') {
      e.preventDefault();
      void this.performRedo.execute();
    }
  }
}
