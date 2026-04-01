import type { TabId } from '../ui/tabs';
import type {
  Catalog,
  CatalogName,
  CatalogType,
  ColorVariableKey,
  ContrastComparisonMethod,
  ContrastVariableKey,
  ContrastValue,
  HexColor,
  SourceType,
  Template,
  TemplateName,
  ThemeName,
  ThemePreviewTokenRefField,
  TokenKey,
  TokenType,
  Version,
} from '../../model/schemas';

export type { ThemePreviewTokenRefField };

export enum AppActionType {
  AppFileMenuExitButtonOnClick = 'APP_FILE_MENU_EXIT_BUTTON_ON_CLICK',
  AppEditMenuUndoButtonOnClick = 'APP_EDIT_MENU_UNDO_BUTTON_ON_CLICK',
  AppEditMenuRedoButtonOnClick = 'APP_EDIT_MENU_REDO_BUTTON_ON_CLICK',
  AppHistoryMenuGoToButtonOnClick = 'APP_HISTORY_MENU_GO_TO_BUTTON_ON_CLICK',
  AppViewMenuReloadButtonOnClick = 'APP_VIEW_MENU_RELOAD_BUTTON_ON_CLICK',
  AppViewMenuForceReloadButtonOnClick = 'APP_VIEW_MENU_FORCE_RELOAD_BUTTON_ON_CLICK',
  AppViewMenuToggleDevToolsButtonOnClick = 'APP_VIEW_MENU_TOGGLE_DEV_TOOLS_BUTTON_ON_CLICK',
  AppRibbonTabButtonOnClick = 'APP_RIBBON_TAB_BUTTON_ON_CLICK',
  AppBarThemeCheckboxOnToggle = 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE',
  AppBarMinimizeButtonOnClick = 'APP_BAR_MINIMIZE_BUTTON_ON_CLICK',
  AppBarMaximizeButtonOnClick = 'APP_BAR_MAXIMIZE_BUTTON_ON_CLICK',
  AppBarCloseButtonOnClick = 'APP_BAR_CLOSE_BUTTON_ON_CLICK',
  AppBarTitleBarOnDrag = 'APP_BAR_TITLE_BAR_ON_DRAG',
}

export enum CatalogActionType {
  CatalogPageOnLoad = 'CATALOG_PAGE_ON_LOAD',
  CatalogCatalogsListOnCommit = 'CATALOG_CATALOGS_LIST_ON_COMMIT',
  CatalogCatalogsCreateButtonOnClick = 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK',
  CatalogCreateDialogOnOpen = 'CATALOG_CREATE_DIALOG_ON_OPEN',
  CatalogCreateDialogNameTextOnChange = 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  CatalogCreateDialogTypeListOnCommit = 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT',
  CatalogCreateDialogCancelButtonOnClick = 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  CatalogCreateDialogOkButtonOnClick = 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
  CatalogDetailsDeleteVersionButtonOnClick = 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  CatalogDetailsSyncButtonOnClick = 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK',
  CatalogDetailsLockButtonOnClick = 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK',
  CatalogDetailsRevertButtonOnClick = 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK',
  CatalogDetailsSaveCatalog = 'CATALOG_DETAILS_SAVE_CATALOG',
  CatalogDetailsSourceUrlTextOnCommit = 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_COMMIT',
  CatalogDetailsSourceTokenTypeListOnCommit = 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT',
  CatalogDetailsSourceTypeListOnCommit = 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT',
  CatalogDetailsSourceRemoveButtonOnClick = 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK',
  CatalogDetailsNewSourceUrlTextOnChange = 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE',
  CatalogDetailsNewSourceTokenTypeListOnCommit = 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT',
  CatalogDetailsNewSourceTypeListOnCommit = 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT',
  CatalogDetailsNewSourceAddButtonOnClick = 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK',
  CatalogTokensSearchTextOnChange = 'CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE',
  CatalogTokensBulkAddButtonOnClick = 'CATALOG_TOKENS_BULK_ADD_BUTTON_ON_CLICK',
  CatalogTokensExistingTokenKeyTextOnCommit = 'CATALOG_TOKENS_EXISTING_TOKEN_KEY_TEXT_ON_COMMIT',
  CatalogTokensTokenRemoveButtonOnClick = 'CATALOG_TOKENS_TOKEN_REMOVE_BUTTON_ON_CLICK',
  CatalogTokensNewTokenKeyTextOnChange = 'CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE',
  CatalogTokensNewTokenAddButtonOnClick = 'CATALOG_TOKENS_NEW_TOKEN_ADD_BUTTON_ON_CLICK',
  CatalogBulkAddTokensDialogOnOpen = 'CATALOG_BULK_ADD_TOKENS_DIALOG_ON_OPEN',
  CatalogBulkAddTokensTextOnChange = 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE',
  CatalogBulkAddTokensCancelButtonOnClick = 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK',
  CatalogBulkAddTokensOkButtonOnClick = 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK',
}

export enum TemplateActionType {
  TemplatePageOnLoad = 'TEMPLATE_PAGE_ON_LOAD',
  TemplateTemplatesListOnCommit = 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT',
  TemplateTemplatesCreateButtonOnClick = 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK',
  TemplateCreateDialogOnOpen = 'TEMPLATE_CREATE_DIALOG_ON_OPEN',
  TemplateCreateDialogNameTextOnChange = 'TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  TemplateCreateDialogCancelButtonOnClick = 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  TemplateCreateDialogOkButtonOnClick = 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
  TemplateDetailsDeleteVersionButtonOnClick = 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  TemplateDetailsLockButtonOnClick = 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK',
  TemplateDetailsUpdateAllButtonOnClick = 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK',
  TemplateDetailsCatalogCheckboxOnToggle = 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE',
  TemplateDetailsCatalogVersionListOnCommit = 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT',
  TemplateDetailsSaveTemplate = 'TEMPLATE_DETAILS_SAVE_TEMPLATE',
  TemplateMappingSearchTextOnChange = 'TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE',
  TemplateMappingColorVariableFilterListOnSelect = 'TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT',
  TemplateMappingContrastVariableFilterListOnSelect = 'TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT',
  TemplateMappingExistingTokenGroupListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_GROUP_LIST_ON_COMMIT',
  TemplateMappingTokenGroupSelectionOnCommit = 'TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION_ON_COMMIT',
  TemplateMappingExistingTokenColorVariableListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT',
  TemplateMappingExistingTokenContrastVariableListOnCommit = 'TEMPLATE_MAPPING_EXISTING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT',
  TemplateMappingSemanticTokenAddVariantButtonOnClick = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK',
  TemplateMappingSemanticTokenModifierListOnCommit = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT',
  TemplateMappingSemanticTokenLanguageListOnCommit = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT',
  TemplateMappingSemanticTokenVariantRemoveButtonOnClick = 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK',
  TemplateGroupAddTextOnChange = 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE',
  TemplateGroupAddButtonOnClick = 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK',
  TemplateGroupRemoveButtonOnClick = 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK',
  TemplateVariablesSearchTextOnChange = 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE',
  TemplateVariablesAddVariableNameTextOnChange = 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE',
  TemplateVariablesAddVariableButtonOnClick = 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK',
  TemplateVariablesGroupListOnCommit = 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT',
  TemplateVariablesRemoveButtonOnClick = 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK',
  TemplateVariablesContrastSourceListOnCommit = 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT',
}

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


/**
 * All user-triggerable app actions (see action-queue rule for convention).
 * Discriminated union; each action has the parameters relevant for triggering it.
 * The AppActionV2 union is the canonical list of all app action event names.
 */
export type AppActionV2 =
  // App Navigation and menu
  | { type: AppActionType.AppFileMenuExitButtonOnClick }
  | { type: AppActionType.AppEditMenuUndoButtonOnClick }
  | { type: AppActionType.AppEditMenuRedoButtonOnClick }
  | { type: AppActionType.AppHistoryMenuGoToButtonOnClick; frameId: string }
  | { type: AppActionType.AppViewMenuReloadButtonOnClick }
  | { type: AppActionType.AppViewMenuForceReloadButtonOnClick }
  | { type: AppActionType.AppViewMenuToggleDevToolsButtonOnClick }
  | { type: AppActionType.AppRibbonTabButtonOnClick; tabId: TabId }
  | { type: AppActionType.AppBarThemeCheckboxOnToggle; checked: boolean }
  | { type: AppActionType.AppBarMinimizeButtonOnClick }
  | { type: AppActionType.AppBarMaximizeButtonOnClick }
  | { type: AppActionType.AppBarCloseButtonOnClick }
  | { type: AppActionType.AppBarTitleBarOnDrag }
  // Catalog page
  | { type: CatalogActionType.CatalogPageOnLoad }
  | { type: CatalogActionType.CatalogCatalogsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogActionType.CatalogCatalogsCreateButtonOnClick }
  | { type: CatalogActionType.CatalogCreateDialogOnOpen }
  | { type: CatalogActionType.CatalogCreateDialogNameTextOnChange; value: string }
  | { type: CatalogActionType.CatalogCreateDialogTypeListOnCommit; value: CatalogType }
  | { type: CatalogActionType.CatalogCreateDialogCancelButtonOnClick }
  | { type: CatalogActionType.CatalogCreateDialogOkButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick; name: CatalogName; version: Version }
  | { type: CatalogActionType.CatalogDetailsSyncButtonOnClick; catalog: Catalog }
  | { type: CatalogActionType.CatalogDetailsLockButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsRevertButtonOnClick; name: CatalogName; version: Version }
  | { type: CatalogActionType.CatalogDetailsSaveCatalog; catalog: Catalog }
  | { type: CatalogActionType.CatalogDetailsSourceUrlTextOnCommit; value: string; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit; value: TokenType; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceTypeListOnCommit; value: SourceType; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange; value: string }
  | { type: CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit; value: TokenType }
  | { type: CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit; value: SourceType }
  | { type: CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick }
  | { type: CatalogActionType.CatalogTokensSearchTextOnChange; value: string }
  | { type: CatalogActionType.CatalogTokensBulkAddButtonOnClick }
  /** Commit a key rename for an existing token. */
  | { type: CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit; value: string; key: TokenKey; tokenType: TokenType }
  | { type: CatalogActionType.CatalogTokensTokenRemoveButtonOnClick; key: TokenKey; tokenType: TokenType }
  | { type: CatalogActionType.CatalogTokensNewTokenKeyTextOnChange; value: string }
  | { type: CatalogActionType.CatalogTokensNewTokenAddButtonOnClick; tokenType: TokenType; key?: string }
  | { type: CatalogActionType.CatalogBulkAddTokensDialogOnOpen }
  | { type: CatalogActionType.CatalogBulkAddTokensTextOnChange; value: string }
  | { type: CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick }
  | { type: CatalogActionType.CatalogBulkAddTokensOkButtonOnClick }
  // Template page
  | { type: TemplateActionType.TemplatePageOnLoad }
  | { type: TemplateActionType.TemplateTemplatesListOnCommit; name: TemplateName; version: Version }
  | { type: TemplateActionType.TemplateTemplatesCreateButtonOnClick }
  | { type: TemplateActionType.TemplateCreateDialogOnOpen }
  | { type: TemplateActionType.TemplateCreateDialogNameTextOnChange; value: string }
  | { type: TemplateActionType.TemplateCreateDialogCancelButtonOnClick }
  | { type: TemplateActionType.TemplateCreateDialogOkButtonOnClick; params: { name: TemplateName } }
  | { type: TemplateActionType.TemplateDetailsDeleteVersionButtonOnClick; name: TemplateName; version: Version }
  | { type: TemplateActionType.TemplateDetailsLockButtonOnClick }
  | { type: TemplateActionType.TemplateDetailsUpdateAllButtonOnClick }
  | { type: TemplateActionType.TemplateDetailsCatalogCheckboxOnToggle; checked: boolean; catalogName: CatalogName }
  | { type: TemplateActionType.TemplateDetailsCatalogVersionListOnCommit; value: Version; catalogName: CatalogName }
  | { type: TemplateActionType.TemplateDetailsSaveTemplate; template: Template }
  | { type: TemplateActionType.TemplateMappingSearchTextOnChange; value: string }
  | { type: TemplateActionType.TemplateMappingColorVariableFilterListOnSelect; values: ColorVariableKey[] }
  | { type: TemplateActionType.TemplateMappingContrastVariableFilterListOnSelect; values: ContrastVariableKey[] }
  /** Set group ref on an existing token mapping (tokenKey + tokenType always required). */
  | { type: TemplateActionType.TemplateMappingExistingTokenGroupListOnCommit; value: string; tokenKey: string; tokenType: TokenType }
  /** Select a group in the mapping UI filter (no token key; pure UI state). */
  | { type: TemplateActionType.TemplateMappingTokenGroupSelectionOnCommit; value: string }
  /** Set color variable ref on an existing token mapping (tokenKey + tokenType always required). */
  | { type: TemplateActionType.TemplateMappingExistingTokenColorVariableListOnCommit; value: ColorVariableKey; tokenKey: string; tokenType: TokenType; isOrphan?: boolean }
  /** Set contrast variable ref on an existing token mapping (tokenKey + tokenType always required). */
  | { type: TemplateActionType.TemplateMappingExistingTokenContrastVariableListOnCommit; value: ContrastVariableKey | null; tokenKey: string; tokenType: TokenType }
  /** Add a new semantic variant; semanticType is the discriminator (required). */
  | { type: TemplateActionType.TemplateMappingSemanticTokenAddVariantButtonOnClick; semanticType: string; modifiers: string[]; language: string | null; defaultGroupRef?: string | null }
  /** Update an existing semantic variant's key. tokenKey identifies the variant; modifiers and language are the new values. */
  | { type: TemplateActionType.TemplateMappingSemanticTokenModifierListOnCommit; tokenKey: string; modifiers: string[]; language: string | null }
  /** Update an existing semantic variant's language. tokenKey identifies the variant. */
  | { type: TemplateActionType.TemplateMappingSemanticTokenLanguageListOnCommit; value: string; tokenKey: string; modifiers: string[] }
  /** Remove an existing semantic variant mapping. tokenKey and tokenType are required. */
  | { type: TemplateActionType.TemplateMappingSemanticTokenVariantRemoveButtonOnClick; tokenKey: string; tokenType: TokenType }
  | { type: TemplateActionType.TemplateGroupAddTextOnChange; value: string }
  /** Add a new group; name is always required. */
  | { type: TemplateActionType.TemplateGroupAddButtonOnClick; name: string }
  /** Remove a group; groupId is always required. */
  | { type: TemplateActionType.TemplateGroupRemoveButtonOnClick; groupId: string }
  | { type: TemplateActionType.TemplateVariablesSearchTextOnChange; value: string }
  | { type: TemplateActionType.TemplateVariablesAddVariableNameTextOnChange; value: string }
  /** Add a variable; key, groupRef, and variableKind are all required. */
  | { type: TemplateActionType.TemplateVariablesAddVariableButtonOnClick; key: string; groupRef: string | null; variableKind: 'color' | 'contrast' }
  /** Update a variable's group; variableKey is always required. */
  | { type: TemplateActionType.TemplateVariablesGroupListOnCommit; value: string; variableKey: string }
  /** Remove a variable; key is always required. */
  | { type: TemplateActionType.TemplateVariablesRemoveButtonOnClick; key: ColorVariableKey | ContrastVariableKey }
  /** Update a contrast variable's comparison source; contrastVariableKey is always required. */
  | { type: TemplateActionType.TemplateVariablesContrastSourceListOnCommit; value: ColorVariableKey | null; contrastVariableKey: ContrastVariableKey }
  // Theme page
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
  /** Toggle a palette cluster group on/off. groupId and checked are always required. */
  | { type: ThemeActionType.ThemePaletteClusterGroupCheckboxOnToggle; checked: boolean; groupId: string }
  /** Set the full selection across all color and contrast refs (replaces checkedColorRefs + checkedContrastRefs). */
  | { type: ThemeActionType.ThemePaletteSwatchFullSelectCheckboxOnToggle; fullColorRefs: string[]; fullContrastRefs: string[] }
  /** Toggle a palette swatch group into the checked set. refs and checked are always required. */
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
