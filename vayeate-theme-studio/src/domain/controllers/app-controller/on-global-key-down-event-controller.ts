import { singleton } from 'tsyringe';
import { PerformRedoOperation, PerformUndoOperation } from '../../operations/undo-operations';

@singleton()
export class OnGlobalKeyDownEventController {
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

