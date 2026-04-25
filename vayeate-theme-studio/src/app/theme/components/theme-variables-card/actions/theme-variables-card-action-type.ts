import type { ColorVariableKey, ContrastComparisonMethod, ContrastValue, ContrastVariableKey } from '../../../../../model/schema/primitives';
import type { AppAction } from '../../../../core/components/action-queue/app-action';

export enum ThemeVariablesCardActionType {
  SearchTextOnChange = 'THEME_VARIABLES_SEARCH_TEXT_ON_CHANGE',
  SelectAllCheckboxOnToggle = 'THEME_VARIABLES_SELECT_ALL_CHECKBOX_ON_TOGGLE',
  SelectVariableTypeCheckboxOnToggle = 'THEME_VARIABLES_SELECT_VARIABLE_TYPE_CHECKBOX_ON_TOGGLE',
  SelectVariableGroupCheckboxOnToggle = 'THEME_VARIABLES_SELECT_VARIABLE_GROUP_CHECKBOX_ON_TOGGLE',
  VariableSelectionCheckboxOnToggle = 'THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE',
  ColorDarkTextOnCommit = 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT',
  ColorDarkColorEyedropperButtonOnClick = 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ColorLightTextOnCommit = 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT',
  ColorLightColorEyedropperButtonOnClick = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ColorUseDarkForLightCheckboxOnToggle = 'THEME_VARIABLES_COLOR_USE_DARK_FOR_LIGHT_CHECKBOX_ON_TOGGLE',
  ContrastDarkValueTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_COMMIT',
  ContrastDarkMethodListOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_METHOD_LIST_ON_COMMIT',
  ContrastDarkMinTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT',
  ContrastDarkMaxTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT',
  ContrastLightValueTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_COMMIT',
  ContrastLightMethodListOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_METHOD_LIST_ON_COMMIT',
  ContrastLightMinTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT',
  ContrastLightMaxTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT',
  ContrastUseDarkForLightCheckboxOnToggle = 'THEME_VARIABLES_CONTRAST_USE_DARK_FOR_LIGHT_CHECKBOX_ON_TOGGLE',
}

export type ThemeVariablesCardActions =
  | { type: ThemeVariablesCardActionType.SearchTextOnChange; value: string }
  | { type: ThemeVariablesCardActionType.SelectAllCheckboxOnToggle; checked: boolean }
  | { type: ThemeVariablesCardActionType.SelectVariableTypeCheckboxOnToggle; checked: boolean; variableType: string }
  | { type: ThemeVariablesCardActionType.SelectVariableGroupCheckboxOnToggle; checked: boolean; groupId: string }
  | {
      type: ThemeVariablesCardActionType.VariableSelectionCheckboxOnToggle;
      ref: ColorVariableKey | ContrastVariableKey;
      checked: boolean;
    }
  | { type: ThemeVariablesCardActionType.ColorDarkTextOnCommit; value: string; ref: ColorVariableKey }
  | { type: ThemeVariablesCardActionType.ColorDarkColorEyedropperButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeVariablesCardActionType.ColorLightTextOnCommit; value: string; ref: ColorVariableKey }
  | { type: ThemeVariablesCardActionType.ColorLightColorEyedropperButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeVariablesCardActionType.ColorUseDarkForLightCheckboxOnToggle; checked: boolean; ref: ColorVariableKey }
  | { type: ThemeVariablesCardActionType.ContrastDarkValueTextOnCommit; value: ContrastValue; ref: ContrastVariableKey }
  | {
      type: ThemeVariablesCardActionType.ContrastDarkMethodListOnCommit;
      value: ContrastComparisonMethod;
      ref: ContrastVariableKey;
    }
  | { type: ThemeVariablesCardActionType.ContrastDarkMinTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeVariablesCardActionType.ContrastDarkMaxTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeVariablesCardActionType.ContrastLightValueTextOnCommit; value: ContrastValue; ref: ContrastVariableKey }
  | {
      type: ThemeVariablesCardActionType.ContrastLightMethodListOnCommit;
      value: ContrastComparisonMethod;
      ref: ContrastVariableKey;
    }
  | { type: ThemeVariablesCardActionType.ContrastLightMinTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeVariablesCardActionType.ContrastLightMaxTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeVariablesCardActionType.ContrastUseDarkForLightCheckboxOnToggle; checked: boolean; ref: ContrastVariableKey };


const themeVariablesCardTypes = new Set<string>(Object.values(ThemeVariablesCardActionType));

export function isThemeVariablesCardAction(a: AppAction): a is ThemeVariablesCardActions {
  return themeVariablesCardTypes.has(a.type);
}
