import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import { UiStateGetter } from '../../../state/ui/ui-state-reducer';
import { CommitAssignColorTextController } from '../palette-color-assign/commit-assign-color-text-controller';
import { CommitHueReferenceColorController } from '../palette-hue/commit-hue-reference-color-controller';
import { SetColorVariableDarkController } from '../variables-color/set-color-variable-dark-controller';
import { SetColorVariableLightController } from '../variables-color/set-color-variable-light-controller';
import { CloseEyedropperOverlayController } from './close-eyedropper-overlay-controller';

const PREFIX_ASSIGN = 'eyedropper:assign:';
const PREFIX_DARK = 'eyedropper:dark:';
const PREFIX_LIGHT = 'eyedropper:light:';

@singleton()
export class CommitEyedropperColorController {
  constructor(
    private readonly closeEyedropperOverlay: CloseEyedropperOverlayController,
    private readonly commitAssignColorText: CommitAssignColorTextController,
    private readonly commitHueReferenceColor: CommitHueReferenceColorController,
    private readonly setColorVariableDark: SetColorVariableDarkController,
    private readonly setColorVariableLight: SetColorVariableLightController,
    private readonly uiStateGetter: UiStateGetter,
  ) {}

  /** Apply `ui.eyedropper.result` for the current eyedropper context (same strings as open overlay), then close. */
  run(): void {
    const { contextKey, result: hex } = this.uiStateGetter.current().eyedropper;
    if (hex === null) {
      this.closeEyedropperOverlay.run();
      return;
    }
    if (!contextKey) {
      this.closeEyedropperOverlay.run();
      return;
    }
    try {
      if (contextKey === 'eyedropper:hue') {
        this.commitHueReferenceColor.run(hex);
        return;
      }
      if (contextKey.startsWith(PREFIX_ASSIGN)) {
        this.commitAssignColorText.run(hex);
        return;
      }
      if (contextKey.startsWith(PREFIX_DARK)) {
        const ref = contextKey.slice(PREFIX_DARK.length) as ColorVariableKey;
        this.setColorVariableDark.run(ref, hex);
        return;
      }
      if (contextKey.startsWith(PREFIX_LIGHT)) {
        const ref = contextKey.slice(PREFIX_LIGHT.length) as ColorVariableKey;
        this.setColorVariableLight.run(ref, hex);
        return;
      }
    } finally {
      this.closeEyedropperOverlay.run();
    }
  }
}
