import { ThemeName, Version, TemplateName, ThemePreviewTokenRefField, TokenKey, HexColor, ColorVariableKey, ContrastVariableKey, ContrastValue, ContrastComparisonMethod } from "../../../model/schemas";

export enum ThemeActionType {
  ThemePageOnLoad = 'THEME_PAGE_ON_LOAD',
  ThemePageSaveErrorDismissButtonOnClick = 'THEME_PAGE_SAVE_ERROR_DISMISS_BUTTON_ON_CLICK',
  ThemeThemesNameListOnCommit = 'THEME_THEMES_NAME_LIST_ON_COMMIT',
  ThemeThemesVersionListOnCommit = 'THEME_THEMES_VERSION_LIST_ON_COMMIT',
  ThemeThemesCreateButtonOnClick = 'THEME_THEMES_CREATE_BUTTON_ON_CLICK',
  ThemeCreateDialogOnOpen = 'THEME_CREATE_DIALOG_ON_OPEN',
  ThemeCreateDialogNameTextOnChange = 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  ThemeCreateDialogCancelButtonOnClick = 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  ThemeCreateDialogOkButtonOnClick = 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
  ThemeDetailsDeleteVersionButtonOnClick = 'THEME_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  ThemeDetailsIncrementVersionButtonOnClick = 'THEME_DETAILS_INCREMENT_VERSION_BUTTON_ON_CLICK',
  ThemeDetailsGenerateButtonOnClick = 'THEME_DETAILS_GENERATE_BUTTON_ON_CLICK',
  ThemeDetailsTemplateListOnCommit = 'THEME_DETAILS_TEMPLATE_LIST_ON_COMMIT',
  ThemeDetailsTemplateVersionListOnCommit = 'THEME_DETAILS_TEMPLATE_VERSION_LIST_ON_COMMIT',
  ThemeDetailsPreviewTokenRefListOnCommit = 'THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT',
  ThemeDetailsCatalogCheckboxOnToggle = 'THEME_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE',
  ThemeDetailsCatalogVersionListOnCommit = 'THEME_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT',
  ThemePaletteApplyToDarkCheckboxOnToggle = 'THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE',
  ThemePaletteApplyToLightCheckboxOnToggle = 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE',
  ThemePaletteAssignColorTextOnChange = 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_CHANGE',
  ThemePaletteAssignColorTextOnCommit = 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_COMMIT',
  ThemePaletteAssignColorButtonOnClick = 'THEME_PALETTE_ASSIGN_COLOR_BUTTON_ON_CLICK',
  ThemePaletteAssignColorEyedropperButtonOnClick = 'THEME_PALETTE_ASSIGN_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemePaletteAssignColorPickerOnSelect = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT',
  ThemePaletteAssignColorPickerOnCommit = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT',
  ThemePaletteAssignColorPickerOnClose = 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE',
  ThemePaletteHueReferenceColorTextOnChange = 'THEME_PALETTE_HUE_REFERENCE_COLOR_TEXT_ON_CHANGE',
  ThemePaletteHueReferenceColorTextOnCommit = 'THEME_PALETTE_HUE_REFERENCE_COLOR_TEXT_ON_COMMIT',
  ThemePaletteHueReferenceColorButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_COLOR_BUTTON_ON_CLICK',
  ThemePaletteHueReferenceColorEyedropperButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemePaletteHueReferenceColorPickerOnSelect = 'THEME_PALETTE_HUE_REFERENCE_COLOR_PICKER_ON_SELECT',
  ThemePaletteHueReferenceColorPickerOnCommit = 'THEME_PALETTE_HUE_REFERENCE_COLOR_PICKER_ON_COMMIT',
  ThemePaletteHueReferenceRecenterButtonOnClick = 'THEME_PALETTE_HUE_REFERENCE_RECENTER_BUTTON_ON_CLICK',
  ThemePaletteHueSliderOnDelta = 'THEME_PALETTE_HUE_SLIDER_ON_DELTA',
  ThemePaletteHueSliderOnCommit = 'THEME_PALETTE_HUE_SLIDER_ON_COMMIT',
  ThemePaletteClusterCountSliderOnDelta = 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA',
  ThemePaletteClusterCountSliderOnCommit = 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_COMMIT',
  ThemePaletteClusterGroupCheckboxOnToggle = 'THEME_PALETTE_CLUSTER_GROUP_CHECKBOX_ON_TOGGLE',
  ThemePaletteSwatchFullSelectCheckboxOnToggle = 'THEME_PALETTE_SWATCH_FULL_SELECT_CHECKBOX_ON_TOGGLE',
  ThemePaletteSwatchGroupSelectCheckboxOnToggle = 'THEME_PALETTE_SWATCH_GROUP_SELECT_CHECKBOX_ON_TOGGLE',
  ThemePalettePrimarySwatchButtonOnClick = 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_CLICK',
  ThemePalettePrimarySwatchButtonOnDoubleClick = 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_DOUBLE_CLICK',
  ThemePalettePrimarySwatchButtonOnRightClick = 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_RIGHT_CLICK',
  ThemePaletteMemberSwatchButtonOnClick = 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_CLICK',
  ThemePaletteMemberSwatchButtonOnRightClick = 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_RIGHT_CLICK',
  ThemeVariablesSelectAllCheckboxOnToggle = 'THEME_VARIABLES_SELECT_ALL_CHECKBOX_ON_TOGGLE',
  ThemeVariablesSelectVariableTypeCheckboxOnToggle = 'THEME_VARIABLES_SELECT_VARIABLE_TYPE_CHECKBOX_ON_TOGGLE',
  ThemeVariablesSelectVariableGroupCheckboxOnToggle = 'THEME_VARIABLES_SELECT_VARIABLE_GROUP_CHECKBOX_ON_TOGGLE',
  ThemeVariablesSearchTextOnChange = 'THEME_VARIABLES_SEARCH_TEXT_ON_CHANGE',
  ThemeVariablesVariableSelectionCheckboxOnToggle = 'THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE',
  ThemeVariablesLightUseDarkCheckboxOnToggle = 'THEME_VARIABLES_LIGHT_USE_DARK_CHECKBOX_ON_TOGGLE',
  ThemeVariablesColorUseDarkForLightCheckboxOnToggle = 'THEME_VARIABLES_COLOR_USE_DARK_FOR_LIGHT_CHECKBOX_ON_TOGGLE',
  ThemeVariablesColorDarkTextOnChange = 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_CHANGE',
  ThemeVariablesColorDarkTextOnCommit = 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT',
  ThemeVariablesColorDarkColorButtonOnClick = 'THEME_VARIABLES_COLOR_DARK_COLOR_BUTTON_ON_CLICK',
  ThemeVariablesColorDarkColorEyedropperButtonOnClick = 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemeVariablesColorDarkColorPickerOnSelect = 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_SELECT',
  ThemeVariablesColorDarkColorPickerOnCommit = 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_COMMIT',
  ThemeVariablesColorLightTextOnChange = 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_CHANGE',
  ThemeVariablesColorLightTextOnCommit = 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT',
  ThemeVariablesColorLightColorButtonOnClick = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_BUTTON_ON_CLICK',
  ThemeVariablesColorLightColorEyedropperButtonOnClick = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemeVariablesColorLightColorPickerOnSelect = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_SELECT',
  ThemeVariablesColorLightColorPickerOnCommit = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_COMMIT',
  ThemeVariablesContrastDarkValueTextOnChange = 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_CHANGE',
  ThemeVariablesContrastDarkValueTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_COMMIT',
  ThemeVariablesContrastDarkMethodListOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_METHOD_LIST_ON_COMMIT',
  ThemeVariablesContrastDarkMinTextOnChange = 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_CHANGE',
  ThemeVariablesContrastDarkMinTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT',
  ThemeVariablesContrastDarkMaxTextOnChange = 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_CHANGE',
  ThemeVariablesContrastDarkMaxTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT',
  ThemeVariablesContrastLightValueTextOnChange = 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_CHANGE',
  ThemeVariablesContrastLightValueTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_COMMIT',
  ThemeVariablesContrastLightMethodListOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_METHOD_LIST_ON_COMMIT',
  ThemeVariablesContrastLightMinTextOnChange = 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_CHANGE',
  ThemeVariablesContrastLightMinTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT',
  ThemeVariablesContrastLightMaxTextOnChange = 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_CHANGE',
  ThemeVariablesContrastLightMaxTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT',
  ThemePreviewVariableListOnCommit = 'THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT',
  ThemePreviewVariableFilterTextOnChange = 'THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE',
  ThemePreviewVariableFilterClearOnClick = 'THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK',
  ThemePreviewSampleButtonOnClick = 'THEME_PREVIEW_SAMPLE_BUTTON_ON_CLICK',
  ThemePreviewSampleListOnCommit = 'THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT',
  ThemeEyedropperOverlayCancelButtonOnClick = 'THEME_EYEDROPPER_OVERLAY_CANCEL_BUTTON_ON_CLICK',
  ThemeEyedropperOverlayColorCommitOnClick = 'THEME_EYEDROPPER_OVERLAY_COLOR_COMMIT_ON_CLICK',
}

export type ThemeActions =
  | { type: ThemeActionType.ThemePageOnLoad }
  | { type: ThemeActionType.ThemePageSaveErrorDismissButtonOnClick }
  | { type: ThemeActionType.ThemeThemesNameListOnCommit; name: ThemeName }
  | { type: ThemeActionType.ThemeThemesVersionListOnCommit; name: ThemeName; version: Version }
  | { type: ThemeActionType.ThemeThemesCreateButtonOnClick }
  | { type: ThemeActionType.ThemeCreateDialogOnOpen }
  | { type: ThemeActionType.ThemeCreateDialogNameTextOnChange; value: string }
  | { type: ThemeActionType.ThemeCreateDialogCancelButtonOnClick }
  | { type: ThemeActionType.ThemeCreateDialogOkButtonOnClick; params: { name: ThemeName } }
  | { type: ThemeActionType.ThemeDetailsDeleteVersionButtonOnClick; name: ThemeName; version: Version }
  | { type: ThemeActionType.ThemeDetailsIncrementVersionButtonOnClick }
  | { type: ThemeActionType.ThemeDetailsGenerateButtonOnClick; themeName: ThemeName; themeVersion: Version; templateName: TemplateName; templateVersion: Version }
  | { type: ThemeActionType.ThemeDetailsTemplateListOnCommit; name: TemplateName; version: Version }
  | { type: ThemeActionType.ThemeDetailsTemplateVersionListOnCommit; name: TemplateName; version: Version }
  | { type: ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit; tokenRefField: ThemePreviewTokenRefField; value: TokenKey | null }
  | { type: ThemeActionType.ThemeDetailsCatalogCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemeDetailsCatalogVersionListOnCommit; value: Version }
  | { type: ThemeActionType.ThemePaletteApplyToDarkCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemePaletteAssignColorTextOnChange; value: string }
  | { type: ThemeActionType.ThemePaletteAssignColorTextOnCommit; value: string }
  | { type: ThemeActionType.ThemePaletteAssignColorButtonOnClick }
  | { type: ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick; colorRef: string }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnSelect; value: HexColor }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnCommit; value: HexColor }
  | { type: ThemeActionType.ThemePaletteAssignColorPickerOnClose }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorTextOnChange; value: string }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorTextOnCommit; value: string }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorButtonOnClick }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorPickerOnSelect; value: HexColor }
  | { type: ThemeActionType.ThemePaletteHueReferenceColorPickerOnCommit; value: HexColor }
  | { type: ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick }
  | { type: ThemeActionType.ThemePaletteHueSliderOnDelta; value: number }
  | { type: ThemeActionType.ThemePaletteHueSliderOnCommit; value: number }
  | { type: ThemeActionType.ThemePaletteClusterCountSliderOnDelta; value: number }
  | { type: ThemeActionType.ThemePaletteClusterCountSliderOnCommit; value: number }
  | { type: ThemeActionType.ThemePaletteClusterGroupCheckboxOnToggle; checked: boolean; groupId: string }
  | { type: ThemeActionType.ThemePaletteSwatchFullSelectCheckboxOnToggle; fullColorRefs: string[]; fullContrastRefs: string[] }
  | { type: ThemeActionType.ThemePaletteSwatchGroupSelectCheckboxOnToggle; refs: string[]; checked: boolean }
  | { type: ThemeActionType.ThemePalettePrimarySwatchButtonOnClick; ref: string }
  | { type: ThemeActionType.ThemePalettePrimarySwatchButtonOnDoubleClick; ref: string }
  | { type: ThemeActionType.ThemePalettePrimarySwatchButtonOnRightClick; ref: string }
  | { type: ThemeActionType.ThemePaletteMemberSwatchButtonOnClick; ref: string }
  | { type: ThemeActionType.ThemePaletteMemberSwatchButtonOnRightClick; ref: string }
  | { type: ThemeActionType.ThemeVariablesSelectAllCheckboxOnToggle; checked: boolean }
  | { type: ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle; checked: boolean; variableType: string }
  | { type: ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle; checked: boolean; groupId: string }
  | { type: ThemeActionType.ThemeVariablesSearchTextOnChange; value: string }
  | { type: ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle; ref: ColorVariableKey | ContrastVariableKey; checked: boolean }
  | { type: ThemeActionType.ThemeVariablesLightUseDarkCheckboxOnToggle; checked: boolean; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle; checked: boolean; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkTextOnChange; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkTextOnCommit; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorPickerOnSelect; value: HexColor; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorDarkColorPickerOnCommit; value: HexColor; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightTextOnChange; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightTextOnCommit; value: string; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorPickerOnSelect; value: HexColor; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesColorLightColorPickerOnCommit; value: HexColor; ref: ColorVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkValueTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit; value: ContrastValue; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit; value: ContrastComparisonMethod; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMinTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMaxTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightValueTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit; value: ContrastValue; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit; value: ContrastComparisonMethod; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMinTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMaxTextOnChange; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit; value: string; ref: ContrastVariableKey }
  | { type: ThemeActionType.ThemePreviewVariableListOnCommit; value: string }
  | { type: ThemeActionType.ThemePreviewVariableFilterTextOnChange; value: string }
  | { type: ThemeActionType.ThemePreviewVariableFilterClearOnClick }
  | { type: ThemeActionType.ThemePreviewSampleButtonOnClick }
  | { type: ThemeActionType.ThemePreviewSampleListOnCommit; value: string }
  | { type: ThemeActionType.ThemeEyedropperOverlayCancelButtonOnClick }
  | { type: ThemeActionType.ThemeEyedropperOverlayColorCommitOnClick; hex: HexColor };
