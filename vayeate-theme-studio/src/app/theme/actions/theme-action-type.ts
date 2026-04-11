import {
  ThemeName,
  Version,
  TemplateName,
  ThemePreviewTokenRefField,
  TokenKey,
  HexColor,
  ColorVariableKey,
  ContrastVariableKey,
  ContrastValue,
  ContrastComparisonMethod,
} from '../../../model/schemas';

export enum ThemeActionType {
  ThemePageOnLoad = 'THEME_PAGE_ON_LOAD',
  ThemePageSaveErrorDismissButtonOnClick = 'THEME_PAGE_SAVE_ERROR_DISMISS_BUTTON_ON_CLICK',
  ThemeThemesNameListOnCommit = 'THEME_THEMES_NAME_LIST_ON_COMMIT',
  ThemeThemesVersionListOnCommit = 'THEME_THEMES_VERSION_LIST_ON_COMMIT',
  ThemeThemesCreateButtonOnClick = 'THEME_THEMES_CREATE_BUTTON_ON_CLICK',
  ThemeCreateDialogNameTextOnChange = 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  ThemeCreateDialogCancelButtonOnClick = 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  ThemeCreateDialogOkButtonOnClick = 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
  ThemeDetailsTemplateListOnCommit = 'THEME_DETAILS_TEMPLATE_LIST_ON_COMMIT',
  ThemeDetailsTemplateVersionListOnCommit = 'THEME_DETAILS_TEMPLATE_VERSION_LIST_ON_COMMIT',
  ThemeDetailsDeleteVersionButtonOnClick = 'THEME_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  ThemeDetailsIncrementVersionButtonOnClick = 'THEME_DETAILS_INCREMENT_VERSION_BUTTON_ON_CLICK',
  ThemeDetailsGenerateButtonOnClick = 'THEME_DETAILS_GENERATE_BUTTON_ON_CLICK',
  ThemePaletteApplyToDarkCheckboxOnToggle = 'THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE',
  ThemePaletteApplyToLightCheckboxOnToggle = 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE',
  ThemePaletteAssignColorEyedropperButtonOnClick = 'THEME_PALETTE_ASSIGN_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemePaletteAssignColorPickerOnSelect = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT',
  ThemePaletteAssignColorPickerOnCommit = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT',
  ThemePaletteAssignColorPickerOnClose = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE',
  ThemePaletteHueReferenceRecenterButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_RECENTER_BUTTON_ON_CLICK',
  ThemePaletteHueReferenceCommit = 'THEME_PALETTE_HUE_REFERENCE_COMMIT',
  ThemePaletteHueReferenceColorEyedropperButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemePaletteHueSliderOnDelta = 'THEME_PALETTE_HUE_SLIDER_ON_DELTA',
  ThemePaletteClusterCountSliderOnDelta = 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA',
  ThemePaletteClusterCountSliderOnCommit = 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_COMMIT',
  ThemeVariablesSearchTextOnChange = 'THEME_VARIABLES_SEARCH_TEXT_ON_CHANGE',
  ThemeVariablesSelectAllCheckboxOnToggle = 'THEME_VARIABLES_SELECT_ALL_CHECKBOX_ON_TOGGLE',
  ThemeVariablesSelectVariableTypeCheckboxOnToggle = 'THEME_VARIABLES_SELECT_VARIABLE_TYPE_CHECKBOX_ON_TOGGLE',
  ThemeVariablesSelectVariableGroupCheckboxOnToggle = 'THEME_VARIABLES_SELECT_VARIABLE_GROUP_CHECKBOX_ON_TOGGLE',
  ThemeVariablesVariableSelectionCheckboxOnToggle = 'THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE',
  ThemePaletteColorRefsSelectionCommit = 'THEME_PALETTE_COLOR_REFS_SELECTION_COMMIT',
  ThemeVariablesColorDarkTextOnCommit = 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT',
  ThemeVariablesColorDarkColorEyedropperButtonOnClick = 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemeVariablesColorLightTextOnCommit = 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT',
  ThemeVariablesColorLightColorEyedropperButtonOnClick = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemeVariablesColorUseDarkForLightCheckboxOnToggle = 'THEME_VARIABLES_COLOR_USE_DARK_FOR_LIGHT_CHECKBOX_ON_TOGGLE',
  ThemeVariablesContrastDarkValueTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_COMMIT',
  ThemeVariablesContrastDarkMethodListOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_METHOD_LIST_ON_COMMIT',
  ThemeVariablesContrastDarkMinTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT',
  ThemeVariablesContrastDarkMaxTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT',
  ThemeVariablesContrastLightValueTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_COMMIT',
  ThemeVariablesContrastLightMethodListOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_METHOD_LIST_ON_COMMIT',
  ThemeVariablesContrastLightMinTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT',
  ThemeVariablesContrastLightMaxTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT',
  ThemeVariablesContrastUseDarkForLightCheckboxOnToggle = 'THEME_VARIABLES_CONTRAST_USE_DARK_FOR_LIGHT_CHECKBOX_ON_TOGGLE',
  ThemeDetailsPreviewTokenRefListOnCommit = 'THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT',
}

export type ThemeActions =
  | { type: ThemeActionType.ThemePageOnLoad }
  | { type: ThemeActionType.ThemePageSaveErrorDismissButtonOnClick }
  | { type: ThemeActionType.ThemeThemesNameListOnCommit; name: ThemeName }
  | { type: ThemeActionType.ThemeThemesVersionListOnCommit; name: ThemeName; version: Version }
  | { type: ThemeActionType.ThemeThemesCreateButtonOnClick }
  | { type: ThemeActionType.ThemeCreateDialogNameTextOnChange; value: string }
  | { type: ThemeActionType.ThemeCreateDialogCancelButtonOnClick }
  | { type: ThemeActionType.ThemeCreateDialogOkButtonOnClick; params: { name: ThemeName } }
  | { type: ThemeActionType.ThemeDetailsTemplateListOnCommit; name: TemplateName; version: Version }
  | { type: ThemeActionType.ThemeDetailsTemplateVersionListOnCommit; name: TemplateName; version: Version }
  | { type: ThemeActionType.ThemeDetailsDeleteVersionButtonOnClick; name: ThemeName; version: Version }
  | { type: ThemeActionType.ThemeDetailsIncrementVersionButtonOnClick }
  | { type: ThemeActionType.ThemeDetailsGenerateButtonOnClick }
  | { type: ThemeActionType.ThemePaletteApplyToDarkCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick; colorRef: string }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnSelect; value: HexColor }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnCommit; value: HexColor }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnClose }
  | { type: ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick }
  | { type: ThemeActionType.ThemePaletteHueReferenceCommit; value: string }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick }
  | { type: ThemeActionType.ThemePaletteHueSliderOnDelta; value: number }
  | { type: ThemeActionType.ThemePaletteClusterCountSliderOnDelta; value: number }
  | { type: ThemeActionType.ThemePaletteClusterCountSliderOnCommit; value: number }
  | { type: ThemeActionType.ThemeVariablesSearchTextOnChange; value: string }
  | { type: ThemeActionType.ThemeVariablesSelectAllCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle; checked: boolean; variableType: string }
  | { type: ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle; checked: boolean; groupId: string }
  | {
      type: ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle;
      ref: ColorVariableKey | ContrastVariableKey;
      checked: boolean;
    }
  | {
      type: ThemeActionType.ThemePaletteColorRefsSelectionCommit;
      refs: string[];
      checked: boolean;
    }
  | { type: ThemeActionType.ThemeVariablesColorDarkTextOnCommit; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightTextOnCommit; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle; checked: boolean; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit; value: ContrastValue; ref: ContrastVariableKey }
  | {
      type: ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit;
      value: ContrastComparisonMethod;
      ref: ContrastVariableKey;
    }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit; value: ContrastValue; ref: ContrastVariableKey }
  | {
      type: ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit;
      value: ContrastComparisonMethod;
      ref: ContrastVariableKey;
    }
  | { type: ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastUseDarkForLightCheckboxOnToggle; checked: boolean; ref: ContrastVariableKey }
  | {
      type: ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit;
      tokenRefField: ThemePreviewTokenRefField;
      value: TokenKey | null;
    };
