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

/**
 * All user-triggerable app actions (see action-queue rule for convention).
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
  | { type: 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE'; checked: boolean }
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
  | { type: 'CATALOG_DETAILS_SAVE_CATALOG'; catalog: Catalog }
  | { type: 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_COMMIT'; value: string; sourceIndex: number }
  | { type: 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT'; value: TokenType; sourceIndex: number }
  | { type: 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT'; value: SourceType; sourceIndex: number }
  | { type: 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK'; sourceIndex: number }
  | { type: 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT'; value: TokenType }
  | { type: 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT'; value: SourceType }
  | { type: 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK' }
  | { type: 'CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_TOKENS_BULK_ADD_BUTTON_ON_CLICK' }
  /** Commit a key rename for an existing token. */
  | { type: 'CATALOG_TOKENS_EXISTING_TOKEN_KEY_TEXT_ON_COMMIT'; value: string; key: TokenKey; tokenType: TokenType }
  | { type: 'CATALOG_TOKENS_TOKEN_REMOVE_BUTTON_ON_CLICK'; key: TokenKey; tokenType: TokenType }
  | { type: 'CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE'; value: string }
  | { type: 'CATALOG_TOKENS_NEW_TOKEN_ADD_BUTTON_ON_CLICK'; tokenType: TokenType; key?: string }
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
  | { type: 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE'; checked: boolean; catalogName: CatalogName }
  | { type: 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT'; value: Version; catalogName: CatalogName }
  | { type: 'TEMPLATE_DETAILS_SAVE_TEMPLATE'; template: Template }
  | { type: 'TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE'; value: string }
  | { type: 'TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT'; values: ColorVariableKey[] }
  | { type: 'TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT'; values: ContrastVariableKey[] }
  /** Set group ref on an existing token mapping (tokenKey + tokenType always required). */
  | { type: 'TEMPLATE_MAPPING_EXISTING_TOKEN_GROUP_LIST_ON_COMMIT'; value: string; tokenKey: string; tokenType: TokenType }
  /** Select a group in the mapping UI filter (no token key; pure UI state). */
  | { type: 'TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION_ON_COMMIT'; value: string }
  /** Set color variable ref on an existing token mapping (tokenKey + tokenType always required). */
  | { type: 'TEMPLATE_MAPPING_EXISTING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT'; value: ColorVariableKey; tokenKey: string; tokenType: TokenType; isOrphan?: boolean }
  /** Set contrast variable ref on an existing token mapping (tokenKey + tokenType always required). */
  | { type: 'TEMPLATE_MAPPING_EXISTING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT'; value: ContrastVariableKey | null; tokenKey: string; tokenType: TokenType }
  /** Add a new semantic variant; semanticType is the discriminator (required). */
  | { type: 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK'; semanticType: string; modifiers: string[]; language: string | null; defaultGroupRef?: string | null }
  /** Update an existing semantic variant's key. tokenKey identifies the variant; modifiers and language are the new values. */
  | { type: 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT'; tokenKey: string; modifiers: string[]; language: string | null }
  /** Update an existing semantic variant's language. tokenKey identifies the variant. */
  | { type: 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT'; value: string; tokenKey: string; modifiers: string[] }
  /** Remove an existing semantic variant mapping. tokenKey and tokenType are required. */
  | { type: 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK'; tokenKey: string; tokenType: TokenType }
  | { type: 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE'; value: string }
  /** Add a new group; name is always required. */
  | { type: 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK'; name: string }
  /** Remove a group; groupId is always required. */
  | { type: 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK'; groupId: string }
  | { type: 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE'; value: string }
  | { type: 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE'; value: string }
  /** Add a variable; key, groupRef, and variableKind are all required. */
  | { type: 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK'; key: string; groupRef: string | null; variableKind: 'color' | 'contrast' }
  /** Update a variable's group; variableKey is always required. */
  | { type: 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT'; value: string; variableKey: string }
  /** Remove a variable; key is always required. */
  | { type: 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK'; key: ColorVariableKey | ContrastVariableKey }
  /** Update a contrast variable's comparison source; contrastVariableKey is always required. */
  | { type: 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT'; value: ColorVariableKey | null; contrastVariableKey: ContrastVariableKey }
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
  | { type: 'THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT'; tokenRefField: ThemePreviewTokenRefField; value: TokenKey | null }
  | { type: 'THEME_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE'; checked: boolean }
  | { type: 'THEME_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT'; value: Version }
  | { type: 'THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE'; checked: boolean }
  | { type: 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE'; checked: boolean }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_CHANGE'; value: string }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_COMMIT'; value: string }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_BUTTON_ON_CLICK' }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_EYEDROPPER_BUTTON_ON_CLICK'; colorRef: string }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT'; value: HexColor }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT'; value: HexColor }
  | { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE' }
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
  /** Toggle a palette cluster group on/off. groupId and checked are always required. */
  | { type: 'THEME_PALETTE_CLUSTER_GROUP_CHECKBOX_ON_TOGGLE'; checked: boolean; groupId: string }
  /** Set the full selection across all color and contrast refs (replaces checkedColorRefs + checkedContrastRefs). */
  | { type: 'THEME_PALETTE_SWATCH_FULL_SELECT_CHECKBOX_ON_TOGGLE'; fullColorRefs: string[]; fullContrastRefs: string[] }
  /** Toggle a palette swatch group into the checked set. refs and checked are always required. */
  | { type: 'THEME_PALETTE_SWATCH_GROUP_SELECT_CHECKBOX_ON_TOGGLE'; refs: string[]; checked: boolean }
  | { type: 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_CLICK'; ref: string }
  | { type: 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_DOUBLE_CLICK'; ref: string }
  | { type: 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_RIGHT_CLICK'; ref: string }
  | { type: 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_CLICK'; ref: string }
  | { type: 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_RIGHT_CLICK'; ref: string }
  | { type: 'THEME_VARIABLES_SELECT_ALL_CHECKBOX_ON_TOGGLE'; checked: boolean }
  | { type: 'THEME_VARIABLES_SELECT_VARIABLE_TYPE_CHECKBOX_ON_TOGGLE'; checked: boolean; variableType: string }
  | { type: 'THEME_VARIABLES_SELECT_VARIABLE_GROUP_CHECKBOX_ON_TOGGLE'; checked: boolean; groupId: string }
  | { type: 'THEME_VARIABLES_SEARCH_TEXT_ON_CHANGE'; value: string }
  | { type: 'THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE'; ref: ColorVariableKey | ContrastVariableKey; checked: boolean }
  | { type: 'THEME_VARIABLES_LIGHT_USE_DARK_CHECKBOX_ON_TOGGLE'; checked: boolean; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_USE_DARK_FOR_LIGHT_CHECKBOX_ON_TOGGLE'; checked: boolean; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_CHANGE'; value: string; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT'; value: string; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_COLOR_BUTTON_ON_CLICK'; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK'; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_SELECT'; value: HexColor; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_COMMIT'; value: HexColor; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_CHANGE'; value: string; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT'; value: string; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_COLOR_BUTTON_ON_CLICK'; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK'; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_SELECT'; value: HexColor; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_COMMIT'; value: HexColor; ref: ColorVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_CHANGE'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_COMMIT'; value: ContrastValue; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_METHOD_LIST_ON_COMMIT'; value: ContrastComparisonMethod; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_CHANGE'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_CHANGE'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_CHANGE'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_COMMIT'; value: ContrastValue; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_METHOD_LIST_ON_COMMIT'; value: ContrastComparisonMethod; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_CHANGE'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_CHANGE'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT'; value: string; ref: ContrastVariableKey }
  | { type: 'THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT'; value: string }
  | { type: 'THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE'; value: string }
  | { type: 'THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK' }
  | { type: 'THEME_PREVIEW_SAMPLE_BUTTON_ON_CLICK' }
  | { type: 'THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT'; value: string };
