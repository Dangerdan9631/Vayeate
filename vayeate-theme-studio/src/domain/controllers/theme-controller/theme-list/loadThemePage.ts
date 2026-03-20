import { singleton } from 'tsyringe';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { LoadThemeRefsController } from './loadThemeRefs';

@singleton()
export class LoadThemePageController {
  constructor(
    private readonly loadThemeRefs: LoadThemeRefsController,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(): Promise<void> {
    await this.loadThemeRefs.run();
    this.setCurrentUndoStackId.execute(null);
  }
}

