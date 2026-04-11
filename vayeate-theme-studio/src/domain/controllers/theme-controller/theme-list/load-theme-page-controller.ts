import { singleton } from 'tsyringe';
import { LoadPreviewsOperation } from '../../../operations/theme-operations/previews/load-previews-operation';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations/set-current-undo-stack-id-operation';

@singleton()
export class LoadThemePageController {
  constructor(
    private readonly loadPreviews: LoadPreviewsOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(): Promise<void> {
    await this.loadPreviews.execute();
    this.setCurrentUndoStackId.execute(null);
  }
}
