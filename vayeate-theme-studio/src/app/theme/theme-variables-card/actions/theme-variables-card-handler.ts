import { singleton } from 'tsyringe';
import { OpenEyedropperOverlayController } from '../../../common/eyedropper-overlay/controllers/open-eyedropper-overlay-controller';
import { SetThemeVariablesSearchTextController } from '../controllers/set-theme-variables-search-text-controller';
import { SetVariablesSelectAllController } from '../controllers/set-variables-select-all-controller';
import { SetVariablesSelectByGroupController } from '../controllers/set-variables-select-by-group-controller';
import { SetVariablesSelectByTypeController } from '../controllers/set-variables-select-by-type-controller';
import { ToggleVariableSelectionController } from '../controllers/toggle-variable-selection-controller';
import { SetColorUseDarkForLightController } from '../controllers/set-color-use-dark-for-light-controller';
import { SetColorVariableDarkController } from '../controllers/set-color-variable-dark-controller';
import { SetColorVariableLightController } from '../controllers/set-color-variable-light-controller';
import { SetContrastUseDarkForLightController } from '../controllers/set-contrast-use-dark-for-light-controller';
import { SetContrastVariableDarkMaxController } from '../controllers/set-contrast-variable-dark-max-controller';
import { SetContrastVariableDarkMethodController } from '../controllers/set-contrast-variable-dark-method-controller';
import { SetContrastVariableDarkMinController } from '../controllers/set-contrast-variable-dark-min-controller';
import { SetContrastVariableDarkValueController } from '../controllers/set-contrast-variable-dark-value-controller';
import { SetContrastVariableLightMaxController } from '../controllers/set-contrast-variable-light-max-controller';
import { SetContrastVariableLightMethodController } from '../controllers/set-contrast-variable-light-method-controller';
import { SetContrastVariableLightMinController } from '../controllers/set-contrast-variable-light-min-controller';
import { SetContrastVariableLightValueController } from '../controllers/set-contrast-variable-light-value-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { ThemeVariablesCardActions, ThemeVariablesCardActionType } from './theme-variables-card-action-type';
import { EyedropperCommitTargetType } from '../../../../model/eyedropper';

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
    private readonly setThemeVariablesSearchText: SetThemeVariablesSearchTextController,
    private readonly setVariablesSelectAll: SetVariablesSelectAllController,
    private readonly setVariablesSelectByGroup: SetVariablesSelectByGroupController,
    private readonly setVariablesSelectByType: SetVariablesSelectByTypeController,
    private readonly toggleVariableSelection: ToggleVariableSelectionController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(ThemeVariablesCardHandler.name);
  }

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
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemeVariablesCardAction union not exhaustive)', { action: _exhaustive });
  }
}
