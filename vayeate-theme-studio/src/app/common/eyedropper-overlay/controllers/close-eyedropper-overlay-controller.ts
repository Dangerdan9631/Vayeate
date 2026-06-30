import { delay, inject, singleton } from 'tsyringe';
import type { HexColor } from '../../../../model/schema/primitives';
import { CloseEyedropperOperation } from '../../../../domain/operations/eyedropper-operations/close-eyedropper-operation';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';
import { EyedropperCommitTargetType, type EyedropperCommitTarget } from '../../../../model/eyedropper';
import { ActionQueue, type IActionQueue } from '../../../core/action-queue/action-queue';
import type { AppAction } from '../../../core/action-queue/app-action';
import { ThemePaletteCardActionType } from '../../../theme/theme-palette-card/actions/theme-palette-card-action-type';
import { ThemeVariablesCardActionType } from '../../../theme/theme-variables-card/actions/theme-variables-card-action-type';

/**
 * Closes the eyedropper overlay and optionally enqueues a commit action for the stored target.
 */
@singleton()
export class CloseEyedropperOverlayController {
  constructor(
    private readonly closeEyedropper: CloseEyedropperOperation,
    @inject(delay(() => ActionQueue)) private readonly actionQueue: IActionQueue,
    private readonly eyedropperUiStore: EyedropperUiStore,
  ) {}

  /**
   * Tears down overlay UI state and routes a picked color back to the originating feature action.
   * @param result Committed hex color, or null when the user cancelled.
   * @returns A promise that settles after close and any follow-up enqueue.
   */
  async run(result: HexColor | null): Promise<void> {
    const commitTarget = this.eyedropperUiStore.getStore().state.commitTarget;
    this.closeEyedropper.execute();

    if (commitTarget && result) {
      this.actionQueue.enqueue(this.toCommitAction(commitTarget, result));
    }
  }

  private toCommitAction(commitTarget: EyedropperCommitTarget, value: HexColor): AppAction {
    switch (commitTarget.type) {
      case EyedropperCommitTargetType.ThemePaletteAssignColor:
        return { type: ThemePaletteCardActionType.AssignColorEyeDropperOnCommit, value };
      case EyedropperCommitTargetType.ThemePaletteHueReference:
        return { type: ThemePaletteCardActionType.HueReferenceEyeDropperOnCommit, value };
      case EyedropperCommitTargetType.ThemeVariableDarkColor:
        return { type: ThemeVariablesCardActionType.ColorDarkColorEyedropperOnCommit, ref: commitTarget.ref, value };
      case EyedropperCommitTargetType.ThemeVariableLightColor:
        return { type: ThemeVariablesCardActionType.ColorLightColorEyedropperOnCommit, ref: commitTarget.ref, value };
    }

    const _exhaustive: never = commitTarget;
    return _exhaustive;
  }
}
