import { singleton } from 'tsyringe';
import { OpenEyedropperOverlayController } from '../../../controllers/Common/eyedropper-overlay/open-eyedropper-overlay-controller';
import { SetThemeVariablesSearchTextController } from '../../../controllers/Theme/theme-variables-card/set-theme-variables-search-text-controller';
import { SetVariablesSelectAllController } from '../../../controllers/Theme/theme-variables-card/set-variables-select-all-controller';
import { SetVariablesSelectByGroupController } from '../../../controllers/Theme/theme-variables-card/set-variables-select-by-group-controller';
import { SetVariablesSelectByTypeController } from '../../../controllers/Theme/theme-variables-card/set-variables-select-by-type-controller';
import { ToggleVariableSelectionController } from '../../../controllers/Theme/theme-variables-card/toggle-variable-selection-controller';
import { SetColorUseDarkForLightController } from '../../../controllers/Theme/theme-variables-card/set-color-use-dark-for-light-controller';
import { SetColorVariableDarkController } from '../../../controllers/Theme/theme-variables-card/set-color-variable-dark-controller';
import { SetColorVariableLightController } from '../../../controllers/Theme/theme-variables-card/set-color-variable-light-controller';
import { SetContrastUseDarkForLightController } from '../../../controllers/Theme/theme-variables-card/set-contrast-use-dark-for-light-controller';
import { SetContrastVariableDarkMaxController } from '../../../controllers/Theme/theme-variables-card/set-contrast-variable-dark-max-controller';
import { SetContrastVariableDarkMethodController } from '../../../controllers/Theme/theme-variables-card/set-contrast-variable-dark-method-controller';
import { SetContrastVariableDarkMinController } from '../../../controllers/Theme/theme-variables-card/set-contrast-variable-dark-min-controller';
import { SetContrastVariableDarkValueController } from '../../../controllers/Theme/theme-variables-card/set-contrast-variable-dark-value-controller';
import { SetContrastVariableLightMaxController } from '../../../controllers/Theme/theme-variables-card/set-contrast-variable-light-max-controller';
import { SetContrastVariableLightMethodController } from '../../../controllers/Theme/theme-variables-card/set-contrast-variable-light-method-controller';
import { SetContrastVariableLightMinController } from '../../../controllers/Theme/theme-variables-card/set-contrast-variable-light-min-controller';
import { SetContrastVariableLightValueController } from '../../../controllers/Theme/theme-variables-card/set-contrast-variable-light-value-controller';
import { SetStyleUseDarkForLightController } from '../../../controllers/Theme/theme-variables-card/set-style-use-dark-for-light-controller';
import { SetStyleVariableFieldController } from '../../../controllers/Theme/theme-variables-card/set-style-variable-field-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/Common/logger';
import { ThemeVariablesCardActions, ThemeVariablesCardActionType } from './theme-variables-card-action-type';
import { EyedropperCommitTargetType } from '../../../../model/Common/eyedropper';

/**
 * Routes Theme Variables Card actions to their controllers.
 */
@singleton()
export class ThemeVariablesCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly openEyedropperOverlay: OpenEyedropperOverlayController,
    private readonly setColorUseDarkForLight: SetColorUseDarkForLightController,
    private readonly setColorVariableDark: SetColorVariableDarkController,
    private readonly setColorVariableLight: SetColorVariableLightController,
    private readonly setContrastUseDarkForLight: SetContrastUseDarkForLightController,
    private readonly setContrastVariableDarkMax: SetContrastVariableDarkMaxController,
    private readonly setContrastVariableDarkMethod: SetContrastVariableDarkMethodController,
    private readonly setContrastVariableDarkMin: SetContrastVariableDarkMinController,
    private readonly setContrastVariableDarkValue: SetContrastVariableDarkValueController,
    private readonly setContrastVariableLightMax: SetContrastVariableLightMaxController,
    private readonly setContrastVariableLightMethod: SetContrastVariableLightMethodController,
    private readonly setContrastVariableLightMin: SetContrastVariableLightMinController,
    private readonly setContrastVariableLightValue: SetContrastVariableLightValueController,
    private readonly setStyleUseDarkForLight: SetStyleUseDarkForLightController,
    private readonly setStyleVariableField: SetStyleVariableFieldController,
    private readonly setThemeVariablesSearchText: SetThemeVariablesSearchTextController,
    private readonly setVariablesSelectAll: SetVariablesSelectAllController,
    private readonly setVariablesSelectByGroup: SetVariablesSelectByGroupController,
    private readonly setVariablesSelectByType: SetVariablesSelectByTypeController,
    private readonly toggleVariableSelection: ToggleVariableSelectionController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(ThemeVariablesCardHandler.name);
  }

  /**
 * Dispatches the action to the matching controller.
 * @param action Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async handle(action: ThemeVariablesCardActions): Promise<void> {
    switch (action.type) {
      case ThemeVariablesCardActionType.SearchTextOnChange:
        return this.setThemeVariablesSearchText.run(action.value);
      case ThemeVariablesCardActionType.SelectAllCheckboxOnToggle:
        return this.setVariablesSelectAll.run(action.checked);
      case ThemeVariablesCardActionType.SelectVariableTypeCheckboxOnToggle:
        return this.setVariablesSelectByType.run(action.checked, action.variableType);
      case ThemeVariablesCardActionType.SelectVariableGroupCheckboxOnToggle:
        return this.setVariablesSelectByGroup.run(action.checked, action.groupId);
      case ThemeVariablesCardActionType.VariableSelectionCheckboxOnToggle:
        return this.toggleVariableSelection.run(action.checked, action.ref);
      case ThemeVariablesCardActionType.ColorDarkTextOnCommit:
        return this.setColorVariableDark.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ColorDarkColorEyedropperButtonOnClick:
        return this.openEyedropperOverlay.run({ type: EyedropperCommitTargetType.ThemeVariableDarkColor, ref: action.ref });
      case ThemeVariablesCardActionType.ColorLightTextOnCommit:
        return this.setColorVariableLight.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ColorLightColorEyedropperButtonOnClick:
        return this.openEyedropperOverlay.run({ type: EyedropperCommitTargetType.ThemeVariableLightColor, ref: action.ref });
      case ThemeVariablesCardActionType.ColorDarkColorEyedropperOnCommit:
        return this.setColorVariableDark.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ColorLightColorEyedropperOnCommit:
        return this.setColorVariableLight.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ColorUseDarkForLightCheckboxOnToggle:
        return this.setColorUseDarkForLight.run(action.ref, action.checked);
      case ThemeVariablesCardActionType.ContrastDarkValueTextOnCommit:
        return this.setContrastVariableDarkValue.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ContrastDarkMethodListOnCommit:
        return this.setContrastVariableDarkMethod.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ContrastDarkMinTextOnCommit:
        return this.setContrastVariableDarkMin.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ContrastDarkMaxTextOnCommit:
        return this.setContrastVariableDarkMax.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ContrastLightValueTextOnCommit:
        return this.setContrastVariableLightValue.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ContrastLightMethodListOnCommit:
        return this.setContrastVariableLightMethod.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ContrastLightMinTextOnCommit:
        return this.setContrastVariableLightMin.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ContrastLightMaxTextOnCommit:
        return this.setContrastVariableLightMax.run(action.ref, action.value);
      case ThemeVariablesCardActionType.ContrastUseDarkForLightCheckboxOnToggle:
        return this.setContrastUseDarkForLight.run(action.ref, action.checked);
      case ThemeVariablesCardActionType.StyleFieldCheckboxOnToggle:
        return this.setStyleVariableField.run(action.ref, action.side, action.field, action.checked);
      case ThemeVariablesCardActionType.StyleUseDarkForLightCheckboxOnToggle:
        return this.setStyleUseDarkForLight.run(action.ref, action.checked);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemeVariablesCardAction union not exhaustive)', { action: _exhaustive });
  }
}
