import { singleton } from 'tsyringe';
import { LoadPreviews } from '../../../operations/theme-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';

@singleton()
export class LoadThemePageController {
  constructor(
    private readonly loadPreviews: LoadPreviews,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(): Promise<void> {
    await this.loadPreviews.execute();
    this.setCurrentUndoStackId.execute(null);
  }
}
