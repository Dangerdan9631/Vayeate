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
  Theme,
  ThemeName,
  TokenKey,
  TokenType,
  Version,
} from '../model/schemas';

export type AppAction =
  | { type: 'TAB_BAR_ON_SELECT'; tabId: TabId }
  | { type: 'CATALOG_PAGE_ON_LOAD' }
  | { type: 'TEMPLATE_PAGE_ON_ENSURE_CATALOGS_FOR_DISPLAY'; refs: Array<{ name: string; version: string }> }
  | { type: 'CATALOG_LIST_ON_SELECT'; name: string; version: string }
  | { type: 'CATALOG_CREATE_DIALOG_ON_OPEN' }
  | { type: 'CATALOG_CREATE_DIALOG_ON_CLOSE' }
  | { type: 'CATALOG_CREATE_FORM_ON_SUBMIT'; params: { name: string; type: 'manual' | 'remote' } }
  | { type: 'CATALOG_SAVE_BUTTON_ON_CLICK'; catalog: Catalog }
  | { type: 'CATALOG_VERSION_DELETE_BUTTON_ON_CLICK'; name: string; version: string }
  | { type: 'CATALOG_SYNC_BUTTON_ON_CLICK'; catalog: Catalog }
  | { type: 'CATALOG_REVERT_BUTTON_ON_CLICK'; name: string; version: string }
  | { type: 'TEMPLATE_PAGE_ON_LOAD' }
  | { type: 'TEMPLATE_LIST_ON_SELECT'; name: string; version: string }
  | { type: 'TEMPLATE_CREATE_DIALOG_ON_OPEN' }
  | { type: 'TEMPLATE_CREATE_DIALOG_ON_CLOSE' }
  | { type: 'TEMPLATE_CREATE_FORM_ON_SUBMIT'; params: { name: string } }
  | { type: 'TEMPLATE_SAVE_BUTTON_ON_CLICK'; template: Template }
  | { type: 'TEMPLATE_VERSION_DELETE_BUTTON_ON_CLICK'; name: string; version: string }
  | { type: 'THEME_PAGE_ON_LOAD' }
  | { type: 'THEME_LIST_ON_SELECT'; name: string; version: string }
  | { type: 'THEME_CREATE_DIALOG_ON_OPEN' }
  | { type: 'THEME_CREATE_DIALOG_ON_CLOSE' }
  | { type: 'THEME_CREATE_FORM_ON_SUBMIT'; params: { name: string } }
  | { type: 'THEME_SAVE_BUTTON_ON_CLICK'; theme: Theme }
  | { type: 'THEME_PANE_ON_SELECT'; checkedColorRefs: string[]; checkedContrastRefs: string[] }
  | { type: 'UNDO_PANEL_ON_RESTORE_THEME'; theme?: Theme | null; checkedColorRefs?: string[]; checkedContrastRefs?: string[]; hueAdjustment?: number; hueReferenceHex?: string; deleteThemeVersionOnRestore?: { name: string; version: string } }
  | { type: 'HUE_ADJUSTMENT_SLIDER_ON_DELTA'; value: number }
  | { type: 'HUE_REFERENCE_INPUT_ON_CHANGE'; value: string }
  | { type: 'UNDO_PANEL_ON_RESTORE_TEMPLATE'; template: Template | null; deleteTemplateVersionOnRestore?: { name: string; version: string } }
  | { type: 'UNDO_PANEL_ON_RESTORE_CATALOG'; catalog: Catalog | null; deleteVersionOnRestore?: { name: string; version: string } }
  | { type: 'THEME_VERSION_DELETE_BUTTON_ON_CLICK'; name: string; version: string }
  | { type: 'THEME_SAVE_ERROR_DIALOG_ON_CLOSE' }
  | { type: 'THEME_GENERATE_BUTTON_ON_CLICK'; themeName: string; themeVersion: string; templateName: string; templateVersion: string }
  | { type: 'VIEW_MENU_RELOAD_ON_CLICK' }
  | { type: 'VIEW_MENU_FORCE_RELOAD_ON_CLICK' }
  | { type: 'VIEW_MENU_TOGGLE_DEV_TOOLS_ON_CLICK' };

/**
 * All user-triggerable app actions (v2 naming; see action-queue rule for convention).
 * Discriminated union; each action has the parameters relevant for triggering it.
 * The AppActionV2 union is the canonical list of all app action event names.
 */
export type AppActionV2 =
  // App Navigation and menu
  | { type: 'APP_APP_ON_LOAD' }
  | { type: 'APP_APP_ON_CLOSE' }
  | { type: 'APP_FILE_MENU_EXIT_BUTTON_ON_CLICK' }
  | { type: 'APP_EDIT_MENU_UNDO_BUTTON_ON_CLICK' }
  | { type: 'APP_EDIT_MENU_REDO_BUTTON_ON_CLICK' }
  | { type: 'APP_HISTORY_MENU_GO_TO_BUTTON_ON_CLICK'; frameId: string }
  | { type: 'APP_VIEW_MENU_RELOAD_BUTTON_ON_CLICK' }
  | { type: 'APP_VIEW_MENU_FORCE_RELOAD_BUTTON_ON_CLICK' }
  | { type: 'APP_VIEW_MENU_TOGGLE_DEV_TOOLS_BUTTON_ON_CLICK' }
  | { type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK'; tabId: TabId }
  | { type: 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE'; checked?: boolean }
  | { type: 'APP_BAR_MINIMIZE_BUTTON_ON_CLICK' }
  | { type: 'APP_BAR_MAXIMIZE_BUTTON_ON_CLICK' }
  | { type: 'APP_BAR_CLOSE_BUTTON_ON_CLICK' }
  | { type: 'APP_BAR_TITLE_BAR_ON_DRAG' }
  // Catalog page
  | { type: 'CATALOG_PAGE_ON_LOAD' }
  | { type: 'CATALOG_CATALOGS_LIST_ON_COMMIT'; name: CatalogName; version: Version }
  | { type: 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK' }
  | { type: 'CATALOG_CREATE_DIALOG_ON_OPEN' }
  | { type: 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT'; value: CatalogType }
  | { type: 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK' }
  | { type: 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK'; params: { name: CatalogName; type: CatalogType } }
  | { type: 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK'; name: CatalogName; version: Version }
  | { type: 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK'; catalog: Catalog }
  | { type: 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK' }
  | { type: 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK'; name: CatalogName; version: Version }
  | { type: 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT'; value: TokenType }
  | { type: 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT'; value: SourceType }
  | { type: 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK'; sourceIndex: number }
  | { type: 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT'; value: TokenType }
  | { type: 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT'; value: SourceType }
  | { type: 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK' }
  | { type: 'CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_TOKENS_BULK_ADD_BUTTON_ON_CLICK' }
  | { type: 'CATALOG_TOKENS_TOKEN_KEY_TEXT_ON_CHANGE'; value: string; key?: TokenKey }
  | { type: 'CATALOG_TOKENS_TOKEN_REMOVE_BUTTON_ON_CLICK'; key: TokenKey }
  | { type: 'CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_TOKENS_NEW_TOKEN_ADD_BUTTON_ON_CLICK' }
  | { type: 'CATALOG_BULK_ADD_TOKENS_DIALOG_ON_OPEN' }
  | { type: 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK' }
  | { type: 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK' }
  // Template page
  | { type: 'TEMPLATE_PAGE_ON_LOAD' }
  | { type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT'; name: TemplateName; version: Version }
  | { type: 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK' }
  | { type: 'TEMPLATE_CREATE_DIALOG_ON_OPEN' }
  | { type: 'TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE'; value: string }
  | { type: 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK' }
  | { type: 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK'; params: { name: TemplateName } }
  | { type: 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK'; name: TemplateName; version: Version }
  | { type: 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK' }
  | { type: 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK' }
  | { type: 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE'; checked?: boolean }
  | { type: 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT'; value: Version }
  | { type: 'TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE'; value: string }
  | { type: 'TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT'; values: ColorVariableKey[] }
  | { type: 'TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT'; values: ContrastVariableKey[] }
  | { type: 'TEMPLATE_MAPPING_TOKEN_GROUP_LIST_ON_COMMIT'; value: string }
  | { type: 'TEMPLATE_MAPPING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT'; value: ColorVariableKey }
  | { type: 'TEMPLATE_MAPPING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT'; value: ContrastVariableKey }
  | { type: 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK'; tokenKey?: TokenKey }
  | { type: 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT'; value: string }
  | { type: 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT'; value: string }
  | { type: 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK'; variantId?: string }
  | { type: 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE'; value: string }
  | { type: 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK' }
  | { type: 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK'; groupId?: string }
  | { type: 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE'; value: string }
  | { type: 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE'; value: string }
  | { type: 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK' }
  | { type: 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT'; value: string }
  | { type: 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK'; key?: ColorVariableKey }
  | { type: 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT'; value: ContrastVariableKey }
  // Theme page
  | { type: 'THEME_PAGE_ON_LOAD' }
  | { type: 'THEME_PAGE_SAVE_ERROR_DISMISS_BUTTON_ON_CLICK' }
  | { type: 'THEME_THEMES_NAME_LIST_ON_COMMIT'; name: ThemeName }
  | { type: 'THEME_THEMES_VERSION_LIST_ON_COMMIT'; name: ThemeName; version: Version }
  | { type: 'THEME_THEMES_CREATE_BUTTON_ON_CLICK' }
  | { type: 'THEME_CREATE_DIALOG_ON_OPEN' }
  | { type: 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE'; value: string }
  | { type: 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK' }
  | { type: 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK'; params: { name: ThemeName } }
  | { type: 'THEME_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK'; name: ThemeName; version: Version }
  | { type: 'THEME_DETAILS_INCREMENT_VERSION_BUTTON_ON_CLICK' }
  | { type: 'THEME_DETAILS_GENERATE_BUTTON_ON_CLICK'; themeName: ThemeName; themeVersion: Version; templateName: TemplateName; templateVersion: Version }
  | { type: 'THEME_DETAILS_TEMPLATE_LIST_ON_COMMIT'; name: TemplateName; version: Version }
  | { type: 'THEME_DETAILS_TEMPLATE_VERSION_LIST_ON_COMMIT'; name: TemplateName; version: Version }
  | { type: 'THEME_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE'; checked?: boolean }
  | { type: 'THEME_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT'; value: Version }
  | { type: 'THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE'; checked?: boolean }
  | { type: 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE'; checked?: boolean }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_CHANGE'; value: string }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_COMMIT'; value: string }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_BUTTON_ON_CLICK' }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_EYEDROPPER_BUTTON_ON_CLICK'; colorRef?: string }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT'; value: HexColor }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT'; value: HexColor }
  | { type: 'THEME_PALETTE_HUE_REFERENCE_COLOR_TEXT_ON_CHANGE'; value: string }
  | { type: 'THEME_PALETTE_HUE_REFERENCE_COLOR_TEXT_ON_COMMIT'; value: string }
  | { type: 'THEME_PALETTE_HUE_REFERENCE_COLOR_BUTTON_ON_CLICK' }
  | { type: 'THEME_PALETTE_HUE_REFERENCE_COLOR_EYEDROPPER_BUTTON_ON_CLICK' }
  | { type: 'THEME_PALETTE_HUE_REFERENCE_COLOR_PICKER_ON_SELECT'; value: HexColor }
  | { type: 'THEME_PALETTE_HUE_REFERENCE_COLOR_PICKER_ON_COMMIT'; value: HexColor }
  | { type: 'THEME_PALETTE_HUE_REFERENCE_RECENTER_BUTTON_ON_CLICK' }
  | { type: 'THEME_PALETTE_HUE_SLIDER_ON_DELTA'; value: number }
  | { type: 'THEME_PALETTE_HUE_SLIDER_ON_COMMIT'; value: number }
  | { type: 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA'; value: number }
  | { type: 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_COMMIT'; value: number }
  | { type: 'THEME_PALETTE_CLUSTER_GROUP_CHECKBOX_ON_TOGGLE'; checked?: boolean; groupId?: string }
  | { type: 'THEME_PALETTE_SWATCH_GROUP_SELECT_CHECKBOX_ON_TOGGLE'; checked?: boolean; refs?: string[] }
  | { type: 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_CLICK'; ref?: string }
  | { type: 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_DOUBLE_CLICK'; ref?: string }
  | { type: 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_RIGHT_CLICK'; ref?: string }
  | { type: 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_CLICK'; ref?: string }
  | { type: 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_RIGHT_CLICK'; ref?: string }
  | { type: 'THEME_VARIABLES_SELECT_ALL_CHECKBOX_ON_TOGGLE'; checked?: boolean }
  | { type: 'THEME_VARIABLES_SELECT_VARIABLE_TYPE_CHECKBOX_ON_TOGGLE'; checked?: boolean; variableType?: string }
  | { type: 'THEME_VARIABLES_SELECT_VARIABLE_GROUP_CHECKBOX_ON_TOGGLE'; checked?: boolean; groupId?: string }
  | { type: 'THEME_VARIABLES_SEARCH_TEXT_ON_CHANGE'; value: string }
  | { type: 'THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE'; checked?: boolean; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_LIGHT_USE_DARK_CHECKBOX_ON_TOGGLE'; checked?: boolean; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_CHANGE'; value: string; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT'; value: string; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_COLOR_BUTTON_ON_CLICK'; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK'; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_SELECT'; value: HexColor; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_COMMIT'; value: HexColor; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_CHANGE'; value: string; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT'; value: string; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_COLOR_BUTTON_ON_CLICK'; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK'; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_SELECT'; value: HexColor; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_COMMIT'; value: HexColor; ref?: ColorVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_CHANGE'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_COMMIT'; value: ContrastValue; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_METHOD_LIST_ON_COMMIT'; value: ContrastComparisonMethod; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_CHANGE'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_CHANGE'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_CHANGE'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_COMMIT'; value: ContrastValue; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_METHOD_LIST_ON_COMMIT'; value: ContrastComparisonMethod; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_CHANGE'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_CHANGE'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT'; value: string; ref?: ContrastVariableKey }
  | { type: 'THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT'; value: string }
  | { type: 'THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE'; value: string }
  | { type: 'THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK' }
  | { type: 'THEME_PREVIEW_SAMPLE_BUTTON_ON_CLICK' }
  | { type: 'THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT'; value: string };
