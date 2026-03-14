import { createContext, useCallback, useReducer, useRef, type ReactNode } from 'react';
import { ActionQueue } from '../../actions/action-queue';
import { ActionQueueV2 } from '../../actions/action-queue-v2';
import type { AppAction, AppActionV2 } from '../../actions/action-types';
import type { AppState } from '../../state/app-state';
import {
  appStateReducer,
  initialAppState,
  type AppStateUpdate,
} from '../../state/app-state';
import {
  ActiveTabContext,
  AppDispatchContext,
  AppDispatchV2Context,
  CatalogsStateContext,
  TemplatesStateContext,
  ThemesStateContext,
} from './slice-contexts';
import { UndoProvider } from './UndoContext';
import * as appController from '../../controllers/app-controller';
import * as catalogController from '../../controllers/catalog-controller';
import * as undoController from '../../controllers/undo-controller';
import * as tabController from '../../controllers/tab-controller';
import * as templateController from '../../controllers/template-controller';
import * as themeController from '../../controllers/theme-controller';
import * as windowController from '../../controllers/window-controller';
import { createLogger } from '../../utils/logger';

const log = createLogger('ActionProcessor');
const logV2 = createLogger('ActionProcessorV2');

type SetState = (update: AppStateUpdate) => void;

function createActionProcessor() {
  return async (action: AppAction, setState: SetState): Promise<void> => {
    log.debug('action', action);
    switch (action.type) {
      case 'TAB_BAR_ON_SELECT':
        tabController.setActiveTab(setState, action.tabId);
        break;

      case 'CATALOG_PAGE_ON_LOAD':
        await catalogController.loadCatalogRefs(setState);
        break;

      case 'TEMPLATE_PAGE_ON_ENSURE_CATALOGS_FOR_DISPLAY':
        await catalogController.loadCatalogsForDisplay(setState, action.refs);
        break;

      case 'CATALOG_LIST_ON_SELECT':
        await catalogController.selectCatalogAndLoad(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'CATALOG_CREATE_DIALOG_ON_OPEN':
        catalogController.openCatalogCreateDialog(setState);
        break;

      case 'CATALOG_CREATE_DIALOG_ON_CLOSE':
        catalogController.closeCatalogCreateDialog(setState);
        break;

      case 'CATALOG_CREATE_FORM_ON_SUBMIT':
        await catalogController.createCatalog(setState, action.params);
        break;

      case 'CATALOG_SAVE_BUTTON_ON_CLICK':
        await catalogController.saveCatalog(setState, action.catalog);
        break;

      case 'CATALOG_VERSION_DELETE_BUTTON_ON_CLICK':
        await catalogController.deleteCatalogVersion(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'CATALOG_SYNC_BUTTON_ON_CLICK':
        await catalogController.syncCatalog(setState, action.catalog);
        break;

      case 'CATALOG_REVERT_BUTTON_ON_CLICK':
        await catalogController.revertCatalogToVersion(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'TEMPLATE_PAGE_ON_LOAD':
        await templateController.loadTemplateRefs(setState);
        await catalogController.loadCatalogRefs(setState);
        break;

      case 'TEMPLATE_LIST_ON_SELECT':
        await templateController.selectTemplateAndLoad(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'TEMPLATE_CREATE_DIALOG_ON_OPEN':
        templateController.openTemplateCreateDialog(setState);
        break;

      case 'TEMPLATE_CREATE_DIALOG_ON_CLOSE':
        templateController.closeTemplateCreateDialog(setState);
        break;

      case 'TEMPLATE_CREATE_FORM_ON_SUBMIT':
        await templateController.createTemplate(setState, action.params);
        break;

      case 'TEMPLATE_SAVE_BUTTON_ON_CLICK':
        await templateController.saveTemplate(setState, action.template);
        break;

      case 'TEMPLATE_VERSION_DELETE_BUTTON_ON_CLICK':
        await templateController.deleteTemplateVersion(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_PAGE_ON_LOAD':
        await themeController.loadThemeRefs(setState);
        break;

      case 'THEME_LIST_ON_SELECT':
        await themeController.selectThemeAndLoad(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_CREATE_DIALOG_ON_OPEN':
        themeController.openThemeCreateDialog(setState);
        break;

      case 'THEME_CREATE_DIALOG_ON_CLOSE':
        themeController.closeThemeCreateDialog(setState);
        break;

      case 'THEME_CREATE_FORM_ON_SUBMIT':
        await themeController.createTheme(setState, action.params);
        break;

      case 'THEME_SAVE_BUTTON_ON_CLICK':
        themeController.saveTheme(setState, action.theme);
        break;

      case 'THEME_PANE_ON_SELECT':
        themeController.setThemePaneSelections(
          setState,
          action.checkedColorRefs,
          action.checkedContrastRefs,
        );
        break;

      case 'UNDO_PANEL_ON_RESTORE_THEME':
        await themeController.restoreThemeState(setState, {
          theme: action.theme,
          checkedColorRefs: action.checkedColorRefs,
          checkedContrastRefs: action.checkedContrastRefs,
          hueAdjustment: action.hueAdjustment,
          hueReferenceHex: action.hueReferenceHex,
          deleteThemeVersionOnRestore: action.deleteThemeVersionOnRestore,
        });
        break;

      case 'HUE_ADJUSTMENT_SLIDER_ON_DELTA':
        themeController.setThemeHueAdjustment(setState, action.value);
        break;

      case 'HUE_REFERENCE_INPUT_ON_CHANGE':
        themeController.setThemeHueReferenceHex(setState, action.value);
        break;

      case 'UNDO_PANEL_ON_RESTORE_TEMPLATE':
        await templateController.restoreTemplateState(
          setState,
          action.template,
          action.deleteTemplateVersionOnRestore,
        );
        break;

      case 'UNDO_PANEL_ON_RESTORE_CATALOG':
        await catalogController.restoreCatalogState(
          setState,
          action.catalog,
          action.deleteVersionOnRestore,
        );
        break;

      case 'THEME_VERSION_DELETE_BUTTON_ON_CLICK':
        await themeController.deleteThemeVersion(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_SAVE_ERROR_DIALOG_ON_CLOSE':
        themeController.clearThemeSaveError(setState);
        break;

      case 'THEME_GENERATE_BUTTON_ON_CLICK':
        await themeController.generateTheme(
          setState,
          action.themeName,
          action.themeVersion,
          action.templateName,
          action.templateVersion,
        );
        break;

      case 'VIEW_MENU_RELOAD_ON_CLICK':
        await windowController.reloadWindow();
        break;

      case 'VIEW_MENU_FORCE_RELOAD_ON_CLICK':
        await windowController.forceReloadWindow();
        break;

      case 'VIEW_MENU_TOGGLE_DEV_TOOLS_ON_CLICK':
        await windowController.toggleDevTools();
        break;
    }
  };
}

type GetState = () => AppState;

export function createActionProcessorV2(getState: GetState): (
  action: AppActionV2,
  setState: SetState
) => Promise<void> {
  return async (action: AppActionV2, setState: SetState): Promise<void> => {
    logV2.debug('action', action);
    switch (action.type) {
      case 'APP_APP_ON_LOAD':
        // Load or restore persisted app preferences (e.g. window size, last tab).
        // Initialize refs and any lazy state needed for the current tab.
        await appController.loadApplication(setState);
        break;
      case 'APP_APP_ON_CLOSE':
        // Persist app state (preferences, window bounds) to disk if needed.
        await appController.unloadApplication(setState);
        break;
      case 'APP_FILE_MENU_EXIT_BUTTON_ON_CLICK':
        // Request main process to quit the app (may trigger APP_APP_ON_CLOSE).
        break;
      case 'APP_EDIT_MENU_UNDO_BUTTON_ON_CLICK':
        await undoController.performUndo(setState, getState);
        break;
      case 'APP_EDIT_MENU_REDO_BUTTON_ON_CLICK':
        await undoController.performRedo(setState, getState);
        break;
      case 'APP_HISTORY_MENU_GO_TO_BUTTON_ON_CLICK':
        await undoController.performHistoryGoTo(setState, getState, action.frameId);
        break;
      case 'APP_VIEW_MENU_RELOAD_BUTTON_ON_CLICK':
        await windowController.reloadWindow();
        break;
      case 'APP_VIEW_MENU_FORCE_RELOAD_BUTTON_ON_CLICK':
        await windowController.forceReloadWindow();
        break;
      case 'APP_VIEW_MENU_TOGGLE_DEV_TOOLS_BUTTON_ON_CLICK':
        await windowController.toggleDevTools();
        break;
      case 'APP_RIBBON_TAB_BUTTON_ON_CLICK':
        // Set active tab in app state to the clicked tab.
        // Optionally load refs for the newly active tab if not yet loaded.
        // Update UI state so the tab content and selection are correct.
        break;
      case 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE':
        // Persist or read dark/light preference and apply to app bar / window.
        // Update UI state so the theme checkbox and bar reflect the new value.
        break;
      case 'APP_BAR_MINIMIZE_BUTTON_ON_CLICK':
        await windowController.minimizeWindow();
        break;
      case 'APP_BAR_MAXIMIZE_BUTTON_ON_CLICK':
        await windowController.maximizeWindow();
        break;
      case 'APP_BAR_CLOSE_BUTTON_ON_CLICK':
        await windowController.closeWindow();
        break;
      case 'APP_BAR_TITLE_BAR_ON_DRAG':
        await windowController.dragWindow();
        break;
      case 'CATALOG_PAGE_ON_LOAD':
        // Read catalog refs from disk (or service) and load into memory.
        // Set catalog list and selected catalog (e.g. first or last used) in state.
        // Update UI state so the catalog list and details pane are populated.
        break;
      case 'CATALOG_CATALOGS_LIST_ON_COMMIT':
        // Load the chosen catalog (name/version) from disk into state.
        // Set selected catalog and ensure refs/list stay in sync.
        // Update UI state so details and tokens reflect the selected catalog.
        break;
      case 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK':
        // Set dialog-open flag and reset create-form fields in state.
        // Update UI state to show the create-catalog dialog.
        break;
      case 'CATALOG_CREATE_DIALOG_ON_OPEN':
        // Reset create-form state (name, type) and set dialog-open flag.
        // Update UI state to show the dialog with empty/default fields.
        break;
      case 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE':
        // Store the new name in create-form state (no persist yet).
        // Update UI state so the text field shows the new value.
        break;
      case 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT':
        // Store the selected catalog type in create-form state.
        // Update UI state so the list shows the selected type.
        break;
      case 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
        // Clear create-form state and set dialog-open to false.
        // Update UI state to hide the dialog.
        break;
      case 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
        // Create the catalog on disk with the given name and type; push to undo if needed.
        // Refresh catalog refs and set the new catalog as selected (or keep current).
        // Update UI state: close dialog, refresh list, show new or current catalog details.
        break;
      case 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
        // Delete the catalog version on disk.
        // Evaluate the next catalog version to be shown (e.g. another version or clear selection).
        // Update UI state to reflect the deletion and new selection.
        break;
      case 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK':
        // Fetch from remote (or source) and write updated catalog to disk; push to undo if needed.
        // Reload catalog into state and recompute refs.
        // Update UI state so details and tokens reflect the synced catalog.
        break;
      case 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK':
        // Toggle locked flag on the catalog in state (and optionally persist).
        // Update UI state so the lock control and editability reflect the new state.
        break;
      case 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK':
        // Load the specified version from disk and write as current; push to undo if needed.
        // Replace current catalog in state with reverted content.
        // Update UI state so details reflect the reverted version.
        break;
      case 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_CHANGE':
        // Store the new URL in the catalog source at the given index in state (no persist yet).
        // Update UI state so the text field shows the new value.
        break;
      case 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT':
        // Store the token type for the source in catalog state.
        // Update UI state so the list shows the selected type.
        break;
      case 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT':
        // Store the source type for the source in catalog state.
        // Update UI state so the list shows the selected type.
        break;
      case 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK':
        // Remove the source at the given index from catalog state; persist catalog to disk.
        // Recompute catalog refs if needed.
        // Update UI state so the source list and details reflect the removal.
        break;
      case 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE':
        // Store the new-source URL in draft/new-source state (no add yet).
        // Update UI state so the text field shows the value.
        break;
      case 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT':
        // Store the token type for the new source in draft state.
        // Update UI state so the list shows the selected type.
        break;
      case 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT':
        // Store the source type for the new source in draft state.
        // Update UI state so the list shows the selected type.
        break;
      case 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK':
        // Append the new source to the catalog in state and persist to disk; push to undo if needed.
        // Clear new-source draft fields.
        // Update UI state so the source list includes the new source and draft is reset.
        break;
      case 'CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE':
        // Store the search text in catalog UI state (filter is derived for display).
        // Update UI state so the tokens list is filtered by the search text.
        break;
      case 'CATALOG_TOKENS_BULK_ADD_BUTTON_ON_CLICK':
        // Set bulk-add dialog open and reset bulk-add text in state.
        // Update UI state to show the bulk-add-tokens dialog.
        break;
      case 'CATALOG_TOKENS_TOKEN_KEY_TEXT_ON_CHANGE':
        // Update the token key in catalog state for the given key (or new-token draft).
        // Update UI state so the text field shows the new key.
        break;
      case 'CATALOG_TOKENS_TOKEN_REMOVE_BUTTON_ON_CLICK':
        // Remove the token with the given key from catalog; persist to disk; push to undo if needed.
        // Recompute token list/refs.
        // Update UI state so the token is removed from the list.
        break;
      case 'CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE':
        // Store the new-token key in draft state (no add yet).
        // Update UI state so the text field shows the value.
        break;
      case 'CATALOG_TOKENS_NEW_TOKEN_ADD_BUTTON_ON_CLICK':
        // Add a token with the current new-token key to the catalog; persist to disk; push to undo if needed.
        // Clear new-token draft.
        // Update UI state so the new token appears in the list and draft is reset.
        break;
      case 'CATALOG_BULK_ADD_TOKENS_DIALOG_ON_OPEN':
        // Set bulk-add dialog open and reset bulk-add text in state.
        // Update UI state to show the dialog with empty text.
        break;
      case 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE':
        // Store the bulk-add text (e.g. pasted keys) in state.
        // Update UI state so the text area shows the value (preview/count optional).
        break;
      case 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK':
        // Set bulk-add dialog closed and clear bulk-add text in state.
        // Update UI state to hide the dialog.
        break;
      case 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK':
        // Parse the bulk-add text into keys; add each token to the catalog; persist to disk; push to undo if needed.
        // Close dialog and clear bulk-add text in state.
        // Update UI state: hide dialog and refresh tokens list.
        break;
      case 'TEMPLATE_PAGE_ON_LOAD':
        // Read template and catalog refs from disk; load into state.
        // Set template list and selected template (e.g. first or last used).
        // Update UI state so the template list and details are populated.
        break;
      case 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT':
        // Load the chosen template (name/version) from disk into state.
        // Set selected template and ensure refs/list stay in sync.
        // Update UI state so details, mapping, and variables reflect the selected template.
        break;
      case 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK':
        // Set create-dialog open and reset create-form fields in state.
        // Update UI state to show the create-template dialog.
        break;
      case 'TEMPLATE_CREATE_DIALOG_ON_OPEN':
        // Reset create-form state (name) and set dialog-open flag.
        // Update UI state to show the dialog with empty/default fields.
        break;
      case 'TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE':
        // Store the new template name in create-form state (no persist yet).
        // Update UI state so the text field shows the new value.
        break;
      case 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
        // Clear create-form state and set dialog-open to false.
        // Update UI state to hide the dialog.
        break;
      case 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
        // Create the template on disk with the given name; push to undo if needed.
        // Refresh template refs and set the new template as selected (or keep current).
        // Update UI state: close dialog, refresh list, show new or current template details.
        break;
      case 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
        // Delete the template version on disk.
        // Evaluate the next template version to be shown (or clear selection).
        // Update UI state to reflect the deletion and new selection.
        break;
      case 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK':
        // Toggle locked flag on the template in state (and optionally persist).
        // Update UI state so the lock control and editability reflect the new state.
        break;
      case 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK':
        // Reload catalog(s) and refresh template mappings/variables from catalog data; persist template to disk.
        // Recompute derived mapping and variable state.
        // Update UI state so mapping and variables reflect the update.
        break;
      case 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE':
        // Toggle catalog pin/usage for the template in state; persist template to disk if needed.
        // Recompute catalog version options and mapping if catalog list changed.
        // Update UI state so the checkbox and dependent controls reflect the new state.
        break;
      case 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT':
        // Store the selected catalog version for the template in state; persist template to disk.
        // Recompute mapping/variables that depend on catalog version.
        // Update UI state so the list and mapping reflect the selected version.
        break;
      case 'TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE':
        // Store the search text in template UI state (filter is derived for display).
        // Update UI state so the mapping list is filtered by the search text.
        break;
      case 'TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT':
        // Store the selected color variable filter in template UI state.
        // Update UI state so the mapping list is filtered by the selected variables.
        break;
      case 'TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT':
        // Store the selected contrast variable filter in template UI state.
        // Update UI state so the mapping list is filtered by the selected variables.
        break;
      case 'TEMPLATE_MAPPING_TOKEN_GROUP_LIST_ON_COMMIT':
        // Set the selected token group in template UI state for editing.
        // Update UI state so the mapping editor shows the selected group’s tokens.
        break;
      case 'TEMPLATE_MAPPING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT':
        // Assign the color variable to the selected token in template state; persist template to disk.
        // Update UI state so the token row shows the assigned variable.
        break;
      case 'TEMPLATE_MAPPING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT':
        // Assign the contrast variable to the selected token in template state; persist template to disk.
        // Update UI state so the token row shows the assigned variable.
        break;
      case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK':
        // Add a semantic variant to the token in template state; persist template to disk.
        // Update UI state so the variant list shows the new variant.
        break;
      case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT':
        // Set the modifier for the semantic variant in template state; persist template to disk.
        // Update UI state so the list shows the selected modifier.
        break;
      case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT':
        // Set the language for the semantic variant in template state; persist template to disk.
        // Update UI state so the list shows the selected language.
        break;
      case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK':
        // Remove the semantic variant from the token in template state; persist template to disk.
        // Update UI state so the variant is removed from the list.
        break;
      case 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE':
        // Store the new group name in draft state (no add yet).
        // Update UI state so the text field shows the value.
        break;
      case 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK':
        // Add a new token group with the draft name to the template; persist template to disk.
        // Clear group draft; recompute group list.
        // Update UI state so the new group appears and draft is reset.
        break;
      case 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK':
        // Remove the selected token group from the template; persist template to disk.
        // Recompute group list and clear selection if the removed group was selected.
        // Update UI state so the group is removed and selection is updated.
        break;
      case 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE':
        // Store the search text in template UI state (filter is derived for display).
        // Update UI state so the variables list is filtered by the search text.
        break;
      case 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE':
        // Store the new variable name in draft state (no add yet).
        // Update UI state so the text field shows the value.
        break;
      case 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK':
        // Add a new color or contrast variable with the draft name to the template; persist template to disk.
        // Clear variable draft; recompute variable list.
        // Update UI state so the new variable appears and draft is reset.
        break;
      case 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT':
        // Assign the group to the variable in template state; persist template to disk.
        // Update UI state so the list shows the selected group.
        break;
      case 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK':
        // Remove the variable with the given key from the template; persist template to disk.
        // Recompute variable list and mapping that reference this variable.
        // Update UI state so the variable is removed from the list.
        break;
      case 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT':
        // Set the contrast source variable for the template in state; persist template to disk.
        // Recompute contrast-related derived state.
        // Update UI state so the list and contrast controls reflect the selection.
        break;
      case 'THEME_PAGE_ON_LOAD':
        // Read theme refs from disk; load into state.
        // Set theme list and selected theme/version (e.g. first or last used).
        // Update UI state so the theme list and details are populated.
        break;
      case 'THEME_PAGE_SAVE_ERROR_DISMISS_BUTTON_ON_CLICK':
        // Clear the theme save error message from state.
        // Update UI state so the error banner is hidden.
        break;
      case 'THEME_THEMES_NAME_LIST_ON_COMMIT':
        // Set the selected theme by name in state; load its versions if needed.
        // Update UI state so the version list and details reflect the selected theme.
        break;
      case 'THEME_THEMES_VERSION_LIST_ON_COMMIT':
        // Load the chosen theme version from disk into state.
        // Set selected theme version; ensure refs and palette/variables stay in sync.
        // Update UI state so details, palette, and variables reflect the selected version.
        break;
      case 'THEME_THEMES_CREATE_BUTTON_ON_CLICK':
        // Set create-dialog open and reset create-form fields in state.
        // Update UI state to show the create-theme dialog.
        break;
      case 'THEME_CREATE_DIALOG_ON_OPEN':
        // Reset create-form state (name) and set dialog-open flag.
        // Update UI state to show the dialog with empty/default fields.
        break;
      case 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE':
        // Store the new theme name in create-form state (no persist yet).
        // Update UI state so the text field shows the new value.
        break;
      case 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
        // Clear create-form state and set dialog-open to false.
        // Update UI state to hide the dialog.
        break;
      case 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
        // Create the theme on disk with the given name; push to undo if needed.
        // Refresh theme refs and set the new theme as selected (or keep current).
        // Update UI state: close dialog, refresh list, show new or current theme details.
        break;
      case 'THEME_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
        // Delete the theme version on disk.
        // Evaluate the next theme version to be shown (or clear selection).
        // Update UI state to reflect the deletion and new selection.
        break;
      case 'THEME_DETAILS_INCREMENT_VERSION_BUTTON_ON_CLICK':
        // Bump the theme version (e.g. minor or patch) in state; persist theme to disk.
        // Recompute version list and keep current version selected.
        // Update UI state so the version control and details reflect the new version.
        break;
      case 'THEME_DETAILS_GENERATE_BUTTON_ON_CLICK':
        // Run theme generator with template and catalog; write theme output to disk (or emit); push to undo if needed.
        // Reload theme into state if output is the current theme.
        // Update UI state so details and preview reflect the generated theme.
        break;
      case 'THEME_DETAILS_TEMPLATE_LIST_ON_COMMIT':
        // Set the template (name/version) used for generation in theme state; persist theme to disk if needed.
        // Load template versions for the selected template if needed.
        // Update UI state so the template list and version list reflect the selection.
        break;
      case 'THEME_DETAILS_TEMPLATE_VERSION_LIST_ON_COMMIT':
        // Set the template version used for generation in theme state; persist theme to disk if needed.
        // Update UI state so the version list shows the selected version.
        break;
      case 'THEME_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE':
        // Toggle catalog usage for the theme in state; persist theme to disk if needed.
        // Recompute catalog version options if catalog list changed.
        // Update UI state so the checkbox and dependent controls reflect the new state.
        break;
      case 'THEME_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT':
        // Set the catalog version used by the theme in state; persist theme to disk if needed.
        // Update UI state so the list and generation inputs reflect the selected version.
        break;
      case 'THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE':
        // Store apply-palette-to-dark flag in theme state; persist theme to disk.
        // Recompute palette application to dark variables if needed.
        // Update UI state so the checkbox and dark palette usage reflect the new value.
        break;
      case 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE':
        // Store apply-palette-to-light flag in theme state; persist theme to disk.
        // Recompute palette application to light variables if needed.
        // Update UI state so the checkbox and light palette usage reflect the new value.
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_CHANGE':
        // Store the assign-color text value in theme UI state (no apply yet).
        // Update UI state so the text field shows the value (and validation if any).
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_COMMIT':
        // Apply the parsed color to the selected swatch/ref in theme state; persist theme to disk.
        // Recompute palette-derived colors if needed.
        // Update UI state so the swatch and variables reflect the new color.
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_BUTTON_ON_CLICK':
        // Open color picker UI or apply current assign-color value to selection; persist if applied.
        // Update UI state to show picker or refresh swatch/variables.
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
        // Request system eyedropper; on pick, apply color to the given ref in theme state; persist theme to disk.
        // Update UI state so the swatch and variables reflect the picked color.
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT':
        // Update the selected swatch/ref with the picked color in theme state (live preview, no persist yet).
        // Update UI state so the swatch and variables show the new color.
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT':
        // Commit the picked color to the selected swatch/ref in theme state; persist theme to disk.
        // Update UI state so the swatch and variables reflect the committed color.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_TEXT_ON_CHANGE':
        // Store the hue reference color text in theme UI state (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_TEXT_ON_COMMIT':
        // Parse and set the hue reference color in theme state; persist theme to disk; recompute hue-derived values.
        // Update UI state so the reference color control and palette reflect the new value.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_BUTTON_ON_CLICK':
        // Open color picker for hue reference; on commit, set in theme state and persist.
        // Update UI state to show picker or refresh reference color.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
        // Request system eyedropper; on pick, set hue reference color in theme state; persist theme to disk.
        // Recompute hue-derived palette values.
        // Update UI state so the reference color and palette reflect the new value.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_PICKER_ON_SELECT':
        // Update hue reference color in theme state for live preview (no persist yet).
        // Update UI state so the reference color and palette show the new value.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_PICKER_ON_COMMIT':
        // Commit the picked hue reference color to theme state; persist theme to disk; recompute hue-derived values.
        // Update UI state so the reference color and palette reflect the committed value.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_RECENTER_BUTTON_ON_CLICK':
        // Set hue adjustment to recenter around the current reference color in theme state; persist if needed.
        // Update UI state so the hue slider and palette reflect the recentered value.
        break;
      case 'THEME_PALETTE_HUE_SLIDER_ON_DELTA':
        // Update hue adjustment in theme state for live preview (no persist yet).
        // Update UI state so the slider and palette show the new value.
        break;
      case 'THEME_PALETTE_HUE_SLIDER_ON_COMMIT':
        // Commit the hue adjustment to theme state; persist theme to disk; recompute hue-derived palette.
        // Update UI state so the slider and palette reflect the committed value.
        break;
      case 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA':
        // Update cluster count in theme state for live preview (no persist yet).
        // Update UI state so the slider and cluster list show the new value.
        break;
      case 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_COMMIT':
        // Commit the cluster count to theme state; persist theme to disk; recompute clusters.
        // Update UI state so the slider and cluster list reflect the committed value.
        break;
      case 'THEME_PALETTE_CLUSTER_GROUP_CHECKBOX_ON_TOGGLE':
        // Toggle inclusion of the cluster group in theme state; persist theme to disk.
        // Recompute palette/swatch visibility or selection if needed.
        // Update UI state so the checkbox and swatches reflect the new state.
        break;
      case 'THEME_PALETTE_SWATCH_GROUP_SELECT_CHECKBOX_ON_TOGGLE':
        // Toggle selection of the given swatch refs in theme state (multi-select).
        // Update UI state so the swatch group selection and assign-color target reflect the new state.
        break;
      case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_CLICK':
        // Set the clicked swatch as the primary selection in theme state.
        // Update UI state so the primary swatch and assign-color target are updated.
        break;
      case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_DOUBLE_CLICK':
        // Set the swatch as primary or open edit (e.g. rename/color) in theme state; persist if edited.
        // Update UI state so the primary swatch or edit UI reflects the action.
        break;
      case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_RIGHT_CLICK':
        // Open context menu for the primary swatch (e.g. set primary, remove); apply chosen action to state and persist.
        // Update UI state so the menu is shown or state is refreshed after action.
        break;
      case 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_CLICK':
        // Add the clicked swatch to selection or set as assign target in theme state.
        // Update UI state so the member swatch selection and assign target are updated.
        break;
      case 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_RIGHT_CLICK':
        // Open context menu for the member swatch (e.g. remove from group); apply chosen action to state and persist.
        // Update UI state so the menu is shown or state is refreshed after action.
        break;
      case 'THEME_VARIABLES_SELECT_ALL_CHECKBOX_ON_TOGGLE':
        // Set all variables’ selection state to the new checked value in theme UI state.
        // Update UI state so all variable checkboxes reflect the new selection.
        break;
      case 'THEME_VARIABLES_SELECT_VARIABLE_TYPE_CHECKBOX_ON_TOGGLE':
        // Toggle selection for all variables of the given type in theme UI state.
        // Update UI state so the variable type checkbox and variable list selection reflect the new state.
        break;
      case 'THEME_VARIABLES_SELECT_VARIABLE_GROUP_CHECKBOX_ON_TOGGLE':
        // Toggle selection for all variables in the given group in theme UI state.
        // Update UI state so the group checkbox and variable list selection reflect the new state.
        break;
      case 'THEME_VARIABLES_SEARCH_TEXT_ON_CHANGE':
        // Store the search text in theme UI state (filter is derived for display).
        // Update UI state so the variables list is filtered by the search text.
        break;
      case 'THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE':
        // Toggle the selection state for the given variable in theme UI state.
        // Update UI state so the variable checkbox and bulk actions reflect the new selection.
        break;
      case 'THEME_VARIABLES_LIGHT_USE_DARK_CHECKBOX_ON_TOGGLE':
        // Set “use dark value for light” for the contrast variable in theme state; persist theme to disk.
        // Recompute light contrast value if it now derives from dark.
        // Update UI state so the checkbox and light contrast control reflect the new value.
        break;
      case 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_CHANGE':
        // Store the dark color text value in theme UI state for the variable (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT':
        // Parse and set the dark color for the variable in theme state; persist theme to disk.
        // Update UI state so the text field and swatch reflect the new color.
        break;
      case 'THEME_VARIABLES_COLOR_DARK_COLOR_BUTTON_ON_CLICK':
        // Open color picker for the variable’s dark color; on commit, set in theme state and persist.
        // Update UI state to show picker or refresh the dark color display.
        break;
      case 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
        // Request system eyedropper; on pick, set dark color for the variable in theme state; persist theme to disk.
        // Update UI state so the dark color swatch and field reflect the picked color.
        break;
      case 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_SELECT':
        // Update the variable’s dark color in theme state for live preview (no persist yet).
        // Update UI state so the swatch and field show the new color.
        break;
      case 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_COMMIT':
        // Commit the picked dark color to the variable in theme state; persist theme to disk.
        // Update UI state so the swatch and field reflect the committed color.
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_CHANGE':
        // Store the light color text value in theme UI state for the variable (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT':
        // Parse and set the light color for the variable in theme state; persist theme to disk.
        // Update UI state so the text field and swatch reflect the new color.
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_BUTTON_ON_CLICK':
        // Open color picker for the variable’s light color; on commit, set in theme state and persist.
        // Update UI state to show picker or refresh the light color display.
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
        // Request system eyedropper; on pick, set light color for the variable in theme state; persist theme to disk.
        // Update UI state so the light color swatch and field reflect the picked color.
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_SELECT':
        // Update the variable’s light color in theme state for live preview (no persist yet).
        // Update UI state so the swatch and field show the new color.
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_COMMIT':
        // Commit the picked light color to the variable in theme state; persist theme to disk.
        // Update UI state so the swatch and field reflect the committed color.
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_CHANGE':
        // Store the dark contrast value text in theme UI state (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_COMMIT':
        // Parse and set the dark contrast value for the variable in theme state; persist theme to disk.
        // Update UI state so the field and contrast indicator reflect the new value.
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_METHOD_LIST_ON_COMMIT':
        // Set the contrast comparison method for the variable’s dark value in theme state; persist theme to disk.
        // Update UI state so the list and contrast indicator reflect the selected method.
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_CHANGE':
        // Store the dark contrast min text in theme UI state (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT':
        // Parse and set the dark contrast min for the variable in theme state; persist theme to disk.
        // Update UI state so the field reflects the new value.
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_CHANGE':
        // Store the dark contrast max text in theme UI state (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT':
        // Parse and set the dark contrast max for the variable in theme state; persist theme to disk.
        // Update UI state so the field reflects the new value.
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_CHANGE':
        // Store the light contrast value text in theme UI state (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_COMMIT':
        // Parse and set the light contrast value for the variable in theme state; persist theme to disk.
        // Update UI state so the field and contrast indicator reflect the new value.
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_METHOD_LIST_ON_COMMIT':
        // Set the contrast comparison method for the variable’s light value in theme state; persist theme to disk.
        // Update UI state so the list and contrast indicator reflect the selected method.
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_CHANGE':
        // Store the light contrast min text in theme UI state (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT':
        // Parse and set the light contrast min for the variable in theme state; persist theme to disk.
        // Update UI state so the field reflects the new value.
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_CHANGE':
        // Store the light contrast max text in theme UI state (no commit yet).
        // Update UI state so the text field shows the value.
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT':
        // Parse and set the light contrast max for the variable in theme state; persist theme to disk.
        // Update UI state so the field reflects the new value.
        break;
      case 'THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT':
        // Set the selected variable for preview in theme UI state.
        // Update UI state so the preview pane shows the selected variable’s usage.
        break;
      case 'THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE':
        // Store the preview variable filter text in theme UI state (filter is derived for display).
        // Update UI state so the preview variable list is filtered.
        break;
      case 'THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK':
        // Clear the preview variable filter text in theme UI state.
        // Update UI state so the filter is cleared and the full list is shown.
        break;
      case 'THEME_PREVIEW_SAMPLE_BUTTON_ON_CLICK':
        // Insert or refresh the preview sample content in theme UI state (or from disk).
        // Update UI state so the preview pane shows the sample.
        break;
      case 'THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT':
        // Set the selected sample for preview in theme UI state.
        // Update UI state so the preview pane shows the selected sample.
        break;
    }
  };
}

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
  dispatchV2: (action: AppActionV2) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useReducer(appStateReducer, initialAppState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const getState = useCallback(() => stateRef.current, []);
  const queueRef = useRef<ActionQueue | null>(null);
  const queueV2Ref = useRef<ActionQueueV2 | null>(null);

  const dispatch = useCallback((action: AppAction) => {
    if (!queueRef.current) {
      const processor = createActionProcessor();
      const queue = new ActionQueue(processor);
      queue.onStateUpdate = (update) => setState(update);
      queue.onQueueStatus = (status) =>
        setState({
          type: 'SET_QUEUE_STATUS',
          isProcessing: status.isProcessing,
          queueLength: status.queueLength,
        });
      queueRef.current = queue;
    }
    queueRef.current.enqueue(action);
  }, []);

  const dispatchV2 = useCallback((action: AppActionV2) => {
    if (!queueV2Ref.current) {
      const processor = createActionProcessorV2(getState);
      const queue = new ActionQueueV2(processor);
      queue.onStateUpdate = (update) => setState(update);
      queue.onQueueStatus = () => {};
      queueV2Ref.current = queue;
    }
    queueV2Ref.current.enqueue(action);
  }, [getState]);

  const value: AppContextValue = { state, dispatch, dispatchV2 };

  return (
    <AppContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>
        <AppDispatchV2Context.Provider value={dispatchV2}>
          <ActiveTabContext.Provider value={state.activeTab}>
          <CatalogsStateContext.Provider value={state.catalogs}>
            <TemplatesStateContext.Provider value={state.templates}>
              <ThemesStateContext.Provider value={state.themes}>
                <UndoProvider setState={setState}>
                  {children}
                </UndoProvider>
              </ThemesStateContext.Provider>
            </TemplatesStateContext.Provider>
          </CatalogsStateContext.Provider>
        </ActiveTabContext.Provider>
      </AppDispatchV2Context.Provider>
    </AppDispatchContext.Provider>
  </AppContext.Provider>
);
}
