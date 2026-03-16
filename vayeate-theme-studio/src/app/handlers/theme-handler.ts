import * as themeController from '../../domain/controllers/theme-controller';
import * as undoController from '../../domain/controllers/undo-controller';
import type { ActionHandler, HandlerDeps, ThemeAction } from './handler-types';

export const handleThemeAction: ActionHandler<ThemeAction> = async (
  action: ThemeAction,
  { setState, getState, setStoreState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case 'THEME_PAGE_ON_LOAD':
      await themeController.loadThemeRefs(setState, setStoreState);
      undoController.resetCurrentUndoStackId(setState);
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
      themeController.setThemeCreateFormName(setState, action.value);
      break;
    case 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
      themeController.closeThemeCreateDialog(setState);
      break;
    case 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
      await themeController.createTheme(setState, setStoreState, action.params);
      break;
    case 'THEME_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
      await themeController.deleteThemeVersion(setState, setStoreState, getState, action.name, action.version);
      break;
    case 'THEME_DETAILS_INCREMENT_VERSION_BUTTON_ON_CLICK':
      await themeController.incrementThemeVersion(setState, setStoreState, getState);
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
      themeController.setApplyPaletteToDark(setState, getState, action.checked);
      break;
    case 'THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE':
      // Store apply-palette-to-light in theme; persist. UI checkbox reflects theme.applyPaletteToLight.
      themeController.setApplyPaletteToLight(setState, getState, action.checked);
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
      // Signal UI to open eyedropper for the given color ref; UI dispatches ASSIGN_COLOR_PICKER_ON_COMMIT with picked hex.
      themeController.setThemeOpenPickerContext(setState, `eyedropper:assign:${action.colorRef}`);
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
      // Signal UI to open color picker for the hue reference.
      themeController.setThemeOpenPickerContext(setState, 'picker:hue');
      break;
    case 'THEME_PALETTE_HUE_REFERENCE_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
      // Signal UI to open eyedropper for the hue reference.
      themeController.setThemeOpenPickerContext(setState, 'eyedropper:hue');
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
        action.groupId,
        action.checked,
      );
      break;
    case 'THEME_PALETTE_SWATCH_FULL_SELECT_CHECKBOX_ON_TOGGLE':
      themeController.setPaletteFullSelection(
        setState,
        action.fullColorRefs,
        action.fullContrastRefs,
      );
      break;
    case 'THEME_PALETTE_SWATCH_GROUP_SELECT_CHECKBOX_ON_TOGGLE':
      themeController.setPaletteSwatchGroupSelection(
        setState,
        getState,
        action.refs,
        action.checked,
      );
      break;
    case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_CLICK':
      themeController.setPalettePrimarySwatch(setState, getState, action.ref);
      break;
    case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_DOUBLE_CLICK':
      themeController.setPalettePrimarySwatch(setState, getState, action.ref);
      break;
    case 'THEME_PALETTE_PRIMARY_SWATCH_BUTTON_ON_RIGHT_CLICK':
      // Context menu handled by UI; same as primary click.
      themeController.setPalettePrimarySwatch(setState, getState, action.ref);
      break;
    case 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_CLICK':
      themeController.setPaletteMemberSwatch(setState, getState, action.ref);
      break;
    case 'THEME_PALETTE_MEMBER_SWATCH_BUTTON_ON_RIGHT_CLICK':
      // Context menu handled by UI; no further state change needed.
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
      themeController.setThemeVariableDraftText(setState, `colorDark:${action.ref}`, action.value);
      break;
    case 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT':
      themeController.setColorVariableDark(setState, getState, action.ref, action.value);
      break;
    case 'THEME_VARIABLES_COLOR_DARK_COLOR_BUTTON_ON_CLICK':
      themeController.setThemeOpenPickerContext(setState, `dark:${action.ref}`);
      break;
    case 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
      // Eyedropper is launched by the UI; this sets context so UI knows which ref is targeted.
      themeController.setThemeOpenPickerContext(setState, `eyedropper:dark:${action.ref}`);
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
      themeController.setThemeVariableDraftText(setState, `colorLight:${action.ref}`, action.value);
      break;
    case 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT':
      themeController.setColorVariableLight(setState, getState, action.ref, action.value);
      break;
    case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_BUTTON_ON_CLICK':
      themeController.setThemeOpenPickerContext(setState, `light:${action.ref}`);
      break;
    case 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK':
      themeController.setThemeOpenPickerContext(setState, `eyedropper:light:${action.ref}`);
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
      themeController.setThemeVariableDraftText(setState, `contrastDark:value:${action.ref}`, action.value);
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
      themeController.setThemeVariableDraftText(setState, `contrastDark:min:${action.ref}`, action.value);
      break;
    case 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT':
      themeController.setContrastVariableDarkMin(setState, getState, action.ref, action.value);
      break;
    case 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_CHANGE':
      themeController.setThemeVariableDraftText(setState, `contrastDark:max:${action.ref}`, action.value);
      break;
    case 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT':
      themeController.setContrastVariableDarkMax(setState, getState, action.ref, action.value);
      break;
    case 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_CHANGE':
      themeController.setThemeVariableDraftText(setState, `contrastLight:value:${action.ref}`, action.value);
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
      themeController.setThemeVariableDraftText(setState, `contrastLight:min:${action.ref}`, action.value);
      break;
    case 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT':
      themeController.setContrastVariableLightMin(setState, getState, action.ref, action.value);
      break;
    case 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_CHANGE':
      themeController.setThemeVariableDraftText(setState, `contrastLight:max:${action.ref}`, action.value);
      break;
    case 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT':
      themeController.setContrastVariableLightMax(setState, getState, action.ref, action.value);
      break;
    case 'THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT':
      // Set the selected variable for preview in theme UI state.
      // Update UI state so the preview pane shows the selected variable's usage.
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
