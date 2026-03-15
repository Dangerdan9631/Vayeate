import { createContext, useCallback, useReducer, useRef, type ReactNode } from 'react';
import { ActionQueue } from '../../actions/action-queue';
import type { AppActionV2 } from '../../actions/action-types';
import type { AppState } from '../../../state/app-state';
import {
  appStateReducer,
  initialAppState,
  type AppStateUpdate,
} from '../../../state/app-state';
import {
  ActiveTabContext,
  AppDispatchContext,
  CatalogsStateContext,
  TemplatesStateContext,
  ThemesStateContext,
} from './slice-contexts';
import { UndoProvider } from './UndoContext';
import * as appController from '../../../controllers/app-controller';
import * as catalogController from '../../../controllers/catalog-controller';
import {
  setCatalogCreateFormName,
  setCatalogCreateFormType,
  setCatalogBulkAddText,
  setCatalogTokensSearchText,
  setCatalogNewSourceUrl,
  setCatalogNewSourceTokenType,
  setCatalogNewSourceType,
  setCatalogNewTokenKey,
} from '../../../operations/catalog-operations';
import * as undoController from '../../../controllers/undo-controller';
import * as tabController from '../../../controllers/tab-controller';
import * as templateController from '../../../controllers/template-controller';
import * as themeController from '../../../controllers/theme-controller';
import * as windowController from '../../../controllers/window-controller';
import { setThemeCreateFormName } from '../../../operations/theme-operations';
import { setCurrentUndoStackId } from '../../../operations/undo-operations';
import { createLogger } from '../../../utils/logger';

const logV2 = createLogger('ActionProcessorV2');

type SetState = (update: AppStateUpdate) => void;

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
        await windowController.closeWindow();
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
        tabController.setActiveTab(setState, action.tabId);
        break;
      case 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE':
        // No-op: UI (ColorSchemeContext) handles toggle and persistence.
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
        await catalogController.loadCatalogRefs(setState);
        setCurrentUndoStackId(setState, null);
        break;
      case 'CATALOG_CATALOGS_LIST_ON_COMMIT':
        await catalogController.selectCatalogAndLoad(setState, action.name, action.version);
        break;
      case 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK':
        catalogController.openCatalogCreateDialog(setState);
        break;
      case 'CATALOG_CREATE_DIALOG_ON_OPEN':
        catalogController.openCatalogCreateDialog(setState);
        break;
      case 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE':
        setCatalogCreateFormName(setState, action.value);
        break;
      case 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT':
        setCatalogCreateFormType(setState, action.value);
        break;
      case 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
        catalogController.closeCatalogCreateDialog(setState);
        break;
      case 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
        await catalogController.createCatalog(setState, action.params);
        break;
      case 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
        await catalogController.deleteCatalogVersion(setState, action.name, action.version);
        break;
      case 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK':
        await catalogController.syncCatalog(setState, action.catalog);
        break;
      case 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK':
        await catalogController.lockCatalog(setState, getState);
        break;
      case 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK':
        await catalogController.revertCatalogToVersion(setState, action.name, action.version);
        break;
      case 'CATALOG_DETAILS_SAVE_CATALOG':
        await catalogController.saveCatalog(setState, action.catalog);
        break;
      case 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_COMMIT':
        await catalogController.updateSourceUrl(setState, getState, action.sourceIndex, action.value);
        break;
      case 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT':
        await catalogController.updateSourceTokenType(setState, getState, action.sourceIndex, action.value);
        break;
      case 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT':
        await catalogController.updateSourceType(setState, getState, action.sourceIndex, action.value);
        break;
      case 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK':
        await catalogController.removeSource(setState, getState, action.sourceIndex);
        break;
      case 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE':
        setCatalogNewSourceUrl(setState, action.value);
        break;
      case 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT':
        setCatalogNewSourceTokenType(setState, action.value);
        break;
      case 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT':
        setCatalogNewSourceType(setState, action.value);
        break;
      case 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK':
        await catalogController.addNewSource(setState, getState);
        break;
      case 'CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE':
        setCatalogTokensSearchText(setState, action.value);
        break;
      case 'CATALOG_TOKENS_BULK_ADD_BUTTON_ON_CLICK':
        catalogController.openBulkAddDialog(setState);
        break;
      case 'CATALOG_TOKENS_TOKEN_KEY_TEXT_ON_CHANGE':
        if (action.key != null && action.tokenType != null) {
          await catalogController.updateTokenKey(
            setState,
            getState,
            action.key,
            action.value,
            action.tokenType,
          );
        } else {
          setCatalogNewTokenKey(setState, action.value);
        }
        break;
      case 'CATALOG_TOKENS_TOKEN_REMOVE_BUTTON_ON_CLICK':
        await catalogController.removeToken(setState, getState, action.key, action.tokenType);
        break;
      case 'CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE':
        setCatalogNewTokenKey(setState, action.value);
        break;
      case 'CATALOG_TOKENS_NEW_TOKEN_ADD_BUTTON_ON_CLICK':
        await catalogController.addNewToken(
          setState,
          getState,
          action.tokenType,
          action.key,
        );
        break;
      case 'CATALOG_BULK_ADD_TOKENS_DIALOG_ON_OPEN':
        catalogController.openBulkAddDialog(setState);
        break;
      case 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE':
        setCatalogBulkAddText(setState, action.value);
        break;
      case 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK':
        catalogController.closeBulkAddDialog(setState);
        break;
      case 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK':
        await catalogController.bulkAddTokens(setState, getState);
        break;
      case 'TEMPLATE_PAGE_ON_LOAD':
        await templateController.loadTemplatePage(setState);
        break;
      case 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT':
        await templateController.selectTemplateAndLoad(setState, action.name, action.version);
        break;
      case 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK':
        templateController.openCreateDialog(setState);
        break;
      case 'TEMPLATE_CREATE_DIALOG_ON_OPEN':
        templateController.openCreateDialog(setState);
        break;
      case 'TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE':
        templateController.setCreateFormName(setState, action.value);
        break;
      case 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
        templateController.closeCreateDialog(setState);
        break;
      case 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
        await templateController.createTemplate(setState, action.params);
        break;
      case 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
        await templateController.deleteTemplateVersion(setState, action.name, action.version);
        break;
      case 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK':
        await templateController.lockTemplate(setState, getState);
        break;
      case 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK':
        await templateController.updateAllCatalogs(setState, getState);
        break;
      case 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE':
        await templateController.toggleCatalog(
          setState,
          getState,
          action.catalogName,
          action.checked ?? true,
        );
        break;
      case 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT':
        await templateController.changeCatalogVersion(
          setState,
          getState,
          action.catalogName,
          action.value,
        );
        break;
      case 'TEMPLATE_DETAILS_SAVE_TEMPLATE':
        await templateController.saveTemplate(setState, action.template);
        break;
      case 'TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE':
        templateController.setMappingSearchText(setState, action.value);
        break;
      case 'TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT':
        templateController.setMappingColorVariableFilter(setState, action.values);
        break;
      case 'TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT':
        templateController.setMappingContrastVariableFilter(setState, action.values);
        break;
      case 'TEMPLATE_MAPPING_TOKEN_GROUP_LIST_ON_COMMIT':
        if (action.tokenKey != null && action.tokenType != null) {
          await templateController.setMappingGroupRef(
            setState,
            getState,
            action.tokenKey,
            action.tokenType,
            action.value || null,
          );
        } else {
          templateController.setMappingTokenGroupSelection(setState, action.value);
        }
        // Update UI state so the mapping editor shows the selected group’s tokens.
        break;
      case 'TEMPLATE_MAPPING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT':
        if (action.tokenKey != null && action.tokenType != null) {
          await templateController.setMappingColorRef(
            setState,
            getState,
            action.tokenKey,
            action.tokenType,
            action.value,
            action.isOrphan,
          );
        }
        break;
      case 'TEMPLATE_MAPPING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT':
        if (action.tokenKey != null && action.tokenType != null) {
          await templateController.setMappingContrastRef(
            setState,
            getState,
            action.tokenKey,
            action.tokenType,
            action.value,
          );
        }
        break;
      case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK': {
        const semanticType = action.tokenKey ?? action.semanticType ?? '';
        const modifiers = action.modifiers ?? [];
        const language = action.language ?? null;
        if (semanticType) {
          await templateController.addSemanticVariant(
            setState,
            getState,
            semanticType,
            modifiers,
            language,
            action.defaultGroupRef,
          );
        }
        break;
      }
      case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT':
        if (action.tokenKey != null && (action.modifiers != null || action.value !== undefined)) {
          await templateController.updateSemanticVariantKey(
            setState,
            getState,
            action.tokenKey,
            action.modifiers ?? (action.value ? [action.value] : []),
            action.language ?? null,
          );
        }
        break;
      case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT':
        if (action.tokenKey != null) {
          await templateController.updateSemanticVariantKey(
            setState,
            getState,
            action.tokenKey,
            action.modifiers ?? [],
            action.value ?? null,
          );
        }
        break;
      case 'TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK':
        if (action.tokenKey != null || action.variantId != null) {
          await templateController.removeMapping(
            setState,
            getState,
            action.tokenKey ?? action.variantId ?? '',
            action.tokenType ?? 'semantic token',
          );
        }
        break;
      case 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE':
        // No-op: UI keeps local state; name passed on ADD_BUTTON.
        break;
      case 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK':
        if (action.name != null && action.name.trim()) {
          await templateController.addGroup(setState, getState, action.name.trim());
        }
        break;
      case 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK':
        if (action.groupId != null) {
          await templateController.removeGroup(setState, getState, action.groupId);
        }
        break;
      case 'TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE':
        templateController.setVariablesSearchText(setState, action.value);
        break;
      case 'TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE':
        // No-op: UI keeps local state; key/groupRef passed on ADD_BUTTON.
        break;
      case 'TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK':
        if (action.key != null && action.key.trim()) {
          if (action.variableKind === 'contrast') {
            await templateController.addContrastVariable(
              setState,
              getState,
              action.key.trim(),
              action.groupRef ?? null,
            );
          } else {
            await templateController.addColorVariable(
              setState,
              getState,
              action.key.trim(),
              action.groupRef ?? null,
            );
          }
        }
        break;
      case 'TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT':
        if (action.variableKey != null) {
          await templateController.updateVariableGroupRef(
            setState,
            getState,
            action.variableKey,
            action.value || null,
          );
        }
        break;
      case 'TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK':
        if (action.key != null) {
          const t = getState().templates.template;
          if (t?.colorVariables.some((v) => v.key === action.key)) {
            await templateController.removeColorVariable(setState, getState, action.key);
          } else {
            await templateController.removeContrastVariable(setState, getState, action.key);
          }
        }
        break;
      case 'TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT':
        if (action.contrastVariableKey != null) {
          await templateController.updateContrastComparisonSource(
            setState,
            getState,
            action.contrastVariableKey,
            action.value,
          );
        }
        break;
      case 'THEME_PAGE_ON_LOAD':
        await themeController.loadThemeRefs(setState);
        setCurrentUndoStackId(setState, null);
        break;
      case 'THEME_PAGE_SAVE_ERROR_DISMISS_BUTTON_ON_CLICK':
        themeController.clearThemeSaveError(setState);
        break;
      case 'THEME_THEMES_NAME_LIST_ON_COMMIT':
        await themeController.selectThemeByName(setState, getState, action.name);
        break;
      case 'THEME_THEMES_VERSION_LIST_ON_COMMIT':
        await themeController.selectThemeAndLoad(setState, action.name, action.version);
        break;
      case 'THEME_THEMES_CREATE_BUTTON_ON_CLICK':
        themeController.openThemeCreateDialog(setState);
        break;
      case 'THEME_CREATE_DIALOG_ON_OPEN':
        themeController.openThemeCreateDialog(setState);
        break;
      case 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE':
        setThemeCreateFormName(setState, action.value);
        break;
      case 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
        themeController.closeThemeCreateDialog(setState);
        break;
      case 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
        await themeController.createTheme(setState, action.params);
        break;
      case 'THEME_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
        await themeController.deleteThemeVersion(setState, action.name, action.version);
        break;
      case 'THEME_DETAILS_INCREMENT_VERSION_BUTTON_ON_CLICK':
        await themeController.incrementThemeVersion(setState, getState);
        break;
      case 'THEME_DETAILS_GENERATE_BUTTON_ON_CLICK':
        await themeController.generateTheme(
          setState,
          action.themeName,
          action.themeVersion,
          action.templateName,
          action.templateVersion,
        );
        break;
      case 'THEME_DETAILS_TEMPLATE_LIST_ON_COMMIT':
        await themeController.setThemeTemplate(setState, getState, action.name, action.version);
        break;
      case 'THEME_DETAILS_TEMPLATE_VERSION_LIST_ON_COMMIT':
        await themeController.setThemeTemplate(setState, getState, action.name, action.version);
        break;
      case 'THEME_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE':
        themeController.setThemeTemplateToggle(setState, getState, action.checked);
        break;
      case 'THEME_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT':
        await themeController.setThemeTemplateVersionOnly(setState, getState, action.value);
        break;
      case 'THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT':
        themeController.setThemePreviewTokenRef(setState, getState, action.tokenRefField, action.value);
        break;
      case 'THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE':
        // Store apply-palette-to-dark in theme; persist. UI checkbox reflects theme.applyPaletteToDark.
        themeController.setApplyPaletteToDark(setState, getState, action.checked ?? true);
        break;
      case 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE':
        // Store apply-palette-to-light in theme; persist. UI checkbox reflects theme.applyPaletteToLight.
        themeController.setApplyPaletteToLight(setState, getState, action.checked ?? true);
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_CHANGE':
        // Store assign-color draft in themes.assignColorDraftText (session only).
        themeController.setAssignColorDraftText(setState, action.value);
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_TEXT_ON_COMMIT':
        // Parse hex, update colorAssignments for checked refs, setTheme + saveTheme.
        themeController.commitAssignColorText(setState, getState, action.value);
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_BUTTON_ON_CLICK':
        // Apply current draft if valid; UI may also open picker.
        themeController.applyAssignColorDraft(setState, getState);
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
        // No-op here; UI runs eyedropper then dispatches ASSIGN_COLOR_PICKER_ON_COMMIT with picked hex.
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT':
        // Live preview: setTheme with updated assignments; no persist.
        themeController.setAssignColorPreview(setState, getState, action.value);
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT':
        // Commit picked color to selection; persist theme.
        themeController.assignColorFromPicker(setState, getState, action.value);
        break;
      case 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE':
        themeController.persistCurrentTheme(setState, getState);
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_TEXT_ON_CHANGE':
        // Store hue reference hex in state (text field value).
        themeController.setThemeHueReferenceHex(setState, action.value);
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_TEXT_ON_COMMIT':
        // Set hue reference hex; optionally reset slider to 0.
        themeController.setThemeHueReferenceHex(setState, action.value);
        themeController.setThemeHueAdjustment(setState, 0);
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_BUTTON_ON_CLICK':
        // No-op; UI opens picker then dispatches PICKER_ON_COMMIT.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
        // No-op; UI runs eyedropper then dispatches with new hex.
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_PICKER_ON_SELECT':
        // Live preview: set hue reference in state (no persist).
        themeController.setThemeHueReferenceHex(setState, action.value);
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_COLOR_PICKER_ON_COMMIT':
        themeController.setThemeHueReferenceHex(setState, action.value);
        themeController.setThemeHueAdjustment(setState, 0);
        break;
      case 'THEME_PALETTE_HUE_REFERENCE_RECENTER_BUTTON_ON_CLICK':
        // Bake hue shift into theme, save, set hueAdjustment to 0.
        themeController.recenterHueReference(setState, getState);
        break;
      case 'THEME_PALETTE_HUE_SLIDER_ON_DELTA':
        themeController.setThemeHueAdjustment(setState, action.value);
        break;
      case 'THEME_PALETTE_HUE_SLIDER_ON_COMMIT':
        themeController.setThemeHueAdjustment(setState, action.value);
        break;
      case 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA':
        themeController.setPaletteClusterCountKPreview(setState, getState, action.value);
        break;
      case 'THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_COMMIT':
        themeController.setPaletteClusterCountK(setState, getState, action.value);
        break;
      case 'THEME_PALETTE_CLUSTER_GROUP_CHECKBOX_ON_TOGGLE':
        themeController.setPaletteClusterGroupToggled(
          setState,
          getState,
          action.groupId ?? '',
          action.checked ?? true,
        );
        break;
      case 'THEME_PALETTE_SWATCH_GROUP_SELECT_CHECKBOX_ON_TOGGLE':
        if (action.fullColorRefs != null && action.fullContrastRefs != null) {
          themeController.setPaletteFullSelection(
            setState,
            action.fullColorRefs,
            action.fullContrastRefs,
          );
        } else {
          themeController.setPaletteSwatchGroupSelection(
            setState,
            getState,
            action.refs ?? [],
            action.checked ?? true,
          );
        }
        break;
      case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_CLICK':
        themeController.setPalettePrimarySwatch(setState, getState, action.ref);
        break;
      case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_DOUBLE_CLICK':
        themeController.setPalettePrimarySwatch(setState, getState, action.ref);
        break;
      case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_RIGHT_CLICK':
        // Context menu handled by UI; no-op or same as primary click.
        themeController.setPalettePrimarySwatch(setState, getState, action.ref);
        break;
      case 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_CLICK':
        themeController.setPaletteMemberSwatch(setState, getState, action.ref);
        break;
      case 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_RIGHT_CLICK':
        // Context menu handled by UI; no-op.
        break;
      case 'THEME_VARIABLES_SELECT_ALL_CHECKBOX_ON_TOGGLE':
        themeController.setVariablesSelectAll(setState, getState, action.checked);
        break;
      case 'THEME_VARIABLES_SELECT_VARIABLE_TYPE_CHECKBOX_ON_TOGGLE':
        themeController.setVariablesSelectByType(
          setState,
          getState,
          action.checked,
          action.variableType,
        );
        break;
      case 'THEME_VARIABLES_SELECT_VARIABLE_GROUP_CHECKBOX_ON_TOGGLE':
        await themeController.setVariablesSelectByGroup(
          setState,
          getState,
          action.checked,
          action.groupId,
        );
        break;
      case 'THEME_VARIABLES_SEARCH_TEXT_ON_CHANGE':
        themeController.setThemeVariablesSearchText(setState, action.value);
        break;
      case 'THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE':
        themeController.toggleVariableSelection(
          setState,
          getState,
          action.checked,
          action.ref,
        );
        break;
      case 'THEME_VARIABLES_LIGHT_USE_DARK_CHECKBOX_ON_TOGGLE':
        themeController.setContrastUseDarkForLight(
          setState,
          getState,
          action.ref,
          action.checked,
        );
        break;
      case 'THEME_VARIABLES_COLOR_USE_DARK_FOR_LIGHT_CHECKBOX_ON_TOGGLE':
        themeController.setColorUseDarkForLight(setState, getState, action.ref, action.checked);
        break;
      case 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_CHANGE':
        break;
      case 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT':
        themeController.setColorVariableDark(setState, getState, action.ref, action.value);
        break;
      case 'THEME_VARIABLES_COLOR_DARK_COLOR_BUTTON_ON_CLICK':
        break;
      case 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
        break;
      case 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_SELECT':
        themeController.setColorVariableFromHexPreview(
          setState,
          getState,
          action.ref,
          action.value,
          'dark',
        );
        break;
      case 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_COMMIT':
        themeController.setColorVariableFromHex(
          setState,
          getState,
          action.ref,
          action.value,
          'dark',
        );
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_CHANGE':
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT':
        themeController.setColorVariableLight(setState, getState, action.ref, action.value);
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_BUTTON_ON_CLICK':
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_SELECT':
        themeController.setColorVariableFromHexPreview(
          setState,
          getState,
          action.ref,
          action.value,
          'light',
        );
        break;
      case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_COMMIT':
        themeController.setColorVariableFromHex(
          setState,
          getState,
          action.ref,
          action.value,
          'light',
        );
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_CHANGE':
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_COMMIT':
        themeController.setContrastVariableDarkValue(
          setState,
          getState,
          action.ref,
          action.value,
        );
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_METHOD_LIST_ON_COMMIT':
        themeController.setContrastVariableDarkMethod(
          setState,
          getState,
          action.ref,
          action.value,
        );
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_CHANGE':
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT':
        themeController.setContrastVariableDarkMin(setState, getState, action.ref, action.value);
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_CHANGE':
        break;
      case 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT':
        themeController.setContrastVariableDarkMax(setState, getState, action.ref, action.value);
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_CHANGE':
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_COMMIT':
        themeController.setContrastVariableLightValue(
          setState,
          getState,
          action.ref,
          action.value,
        );
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_METHOD_LIST_ON_COMMIT':
        themeController.setContrastVariableLightMethod(
          setState,
          getState,
          action.ref,
          action.value,
        );
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_CHANGE':
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT':
        themeController.setContrastVariableLightMin(setState, getState, action.ref, action.value);
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_CHANGE':
        break;
      case 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT':
        themeController.setContrastVariableLightMax(setState, getState, action.ref, action.value);
        break;
      case 'THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT':
        // Set the selected variable for preview in theme UI state.
        // Update UI state so the preview pane shows the selected variable’s usage.
        themeController.setPreviewVariableSelection(setState, getState, action.value);
        break;
      case 'THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE':
        // Store the preview variable filter text in theme UI state (filter is derived for display).
        // Update UI state so the preview variable list is filtered.
        themeController.setPreviewVariableFilterText(setState, action.value);
        break;
      case 'THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK':
        // Clear the preview variable filter text in theme UI state.
        // Update UI state so the filter is cleared and the full list is shown.
        themeController.clearPreviewVariableFilter(setState);
        break;
      case 'THEME_PREVIEW_SAMPLE_BUTTON_ON_CLICK':
        // Insert or refresh the preview sample content in theme UI state (or from disk).
        // Update UI state so the preview pane shows the sample.
        themeController.previewSampleButtonScroll(setState);
        break;
      case 'THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT':
        // Set the selected sample for preview in theme UI state.
        // Update UI state so the preview pane shows the selected sample.
        themeController.setPreviewSelectedSample(setState, action.value);
        break;
    }
  };
}

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppActionV2) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useReducer(appStateReducer, initialAppState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const getState = useCallback(() => stateRef.current, []);
  const queueRef = useRef<ActionQueue | null>(null);

  const dispatch = useCallback((action: AppActionV2) => {
    if (!queueRef.current) {
      const processor = createActionProcessorV2(getState);
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
  }, [getState]);

  const value: AppContextValue = { state, dispatch };

  return (
    <AppContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>
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
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}
