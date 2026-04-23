import { singleton } from 'tsyringe';
import { PerformRedoOperation } from '../../../../../domain/operations/undo-operations/perform-redo-operation';
import { PerformUndoOperation } from '../../../../../domain/operations/undo-operations/perform-undo-operation';

@singleton()
export class HandleKeyboardShortcutController {
  constructor(
    private readonly performUndo: PerformUndoOperation,
    private readonly performRedo: PerformRedoOperation,
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
