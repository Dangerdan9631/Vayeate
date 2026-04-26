import { singleton } from 'tsyringe';
import { CommitAssignColorTextOperation } from '../../../../domain/operations/theme-operations/palette-color-assign/commit-assign-color-text-operation';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';

@singleton()
export class CommitAssignColorEyeDropperController {
  constructor(
    private readonly eyeDropperUiStore: EyedropperUiStore,
    private readonly commitAssignColorText: CommitAssignColorTextOperation,
  ) {}

  run(): void {
    const eyeDropperResult = this.eyeDropperUiStore.getStore().state.result;
    if (!eyeDropperResult) return;

    this.commitAssignColorText.execute(eyeDropperResult);
  }
}
