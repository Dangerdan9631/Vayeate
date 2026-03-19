import * as themeController from '../../domain/controllers/theme-controller';
import * as undoController from '../../domain/controllers/undo-controller';
import type { ActionHandler, HandlerDeps, ThemeAction } from './handler-types';
import { ThemeActionType } from '../actions/action-types';

export const handleThemeAction: ActionHandler<ThemeAction> = async (
  action: ThemeAction,
  { setState, getState, setStoreState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case ThemeActionType.ThemePageOnLoad:
      await themeController.loadThemeRefs(setState, setStoreState);
      undoController.resetCurrentUndoStackId(setState);
      break;
    case ThemeActionType.ThemePageSaveErrorDismissButtonOnClick:
      themeController.clearThemeSaveError(setState);
      break;
    case ThemeActionType.ThemeThemesNameListOnCommit:
      await themeController.selectThemeByName(setState, getState, action.name);
      break;
    case ThemeActionType.ThemeThemesVersionListOnCommit:
      await themeController.selectThemeAndLoad(setState, action.name, action.version);
      break;
    case ThemeActionType.ThemeThemesCreateButtonOnClick:
      themeController.openThemeCreateDialog(setState);
      break;
    case ThemeActionType.ThemeCreateDialogOnOpen:
      themeController.openThemeCreateDialog(setState);
      break;
    case ThemeActionType.ThemeCreateDialogNameTextOnChange:
      themeController.setThemeCreateFormName(setState, action.value);
      break;
    case ThemeActionType.ThemeCreateDialogCancelButtonOnClick:
      themeController.closeThemeCreateDialog(setState);
      break;
    case ThemeActionType.ThemeCreateDialogOkButtonOnClick:
      await themeController.createTheme(setState, setStoreState, action.params);
      break;
    case ThemeActionType.ThemeDetailsDeleteVersionButtonOnClick:
      await themeController.deleteThemeVersion(setState, setStoreState, getState, action.name, action.version);
      break;
    case ThemeActionType.ThemeDetailsIncrementVersionButtonOnClick:
      await themeController.incrementThemeVersion(setState, setStoreState, getState);
      break;
    case ThemeActionType.ThemeDetailsGenerateButtonOnClick:
      await themeController.generateTheme(
        setState,
        action.themeName,
        action.themeVersion,
        action.templateName,
        action.templateVersion,
      );
      break;
    case ThemeActionType.ThemeDetailsTemplateListOnCommit:
      await themeController.setThemeTemplate(setState, getState, action.name, action.version);
      break;
    case ThemeActionType.ThemeDetailsTemplateVersionListOnCommit:
      await themeController.setThemeTemplate(setState, getState, action.name, action.version);
      break;
    case ThemeActionType.ThemeDetailsCatalogCheckboxOnToggle:
      themeController.setThemeTemplateToggle(setState, getState, action.checked);
      break;
    case ThemeActionType.ThemeDetailsCatalogVersionListOnCommit:
      await themeController.setThemeTemplateVersionOnly(setState, getState, action.value);
      break;
    case ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit:
      themeController.setThemePreviewTokenRef(setState, getState, action.tokenRefField, action.value);
      break;
    case ThemeActionType.ThemePaletteApplyToDarkCheckboxOnToggle:
      // Store apply-palette-to-dark in theme; persist. UI checkbox reflects theme.applyPaletteToDark.
      themeController.setApplyPaletteToDark(setState, getState, action.checked);
      break;
    case ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle:
      // Store apply-palette-to-light in theme; persist. UI checkbox reflects theme.applyPaletteToLight.
      themeController.setApplyPaletteToLight(setState, getState, action.checked);
      break;
    case ThemeActionType.ThemePaletteAssignColorTextOnChange:
      // Store assign-color draft in themes.assignColorDraftText (session only).
      themeController.setAssignColorDraftText(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorTextOnCommit:
      // Parse hex, update colorAssignments for checked refs, setTheme + saveTheme.
      themeController.commitAssignColorText(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorButtonOnClick:
      // Apply current draft if valid; UI may also open picker.
      themeController.applyAssignColorDraft(setState, getState);
      break;
    case ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick:
      // Signal UI to open eyedropper for the given color ref; UI dispatches ASSIGN_COLOR_PICKER_ON_COMMIT with picked hex.
      themeController.setThemeOpenPickerContext(setState, `eyedropper:assign:${action.colorRef}`);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnSelect:
      // Live preview: setTheme with updated assignments; no persist.
      themeController.setAssignColorPreview(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnCommit:
      // Commit picked color to selection; persist theme.
      themeController.assignColorFromPicker(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnClose:
      themeController.persistCurrentTheme(setState, getState);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorTextOnChange:
      // Store hue reference hex in state (text field value).
      themeController.setThemeHueReferenceHex(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorTextOnCommit:
      // Set hue reference hex; optionally reset slider to 0.
      themeController.setThemeHueReferenceHex(setState, action.value);
      themeController.setThemeHueAdjustment(setState, 0);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorButtonOnClick:
      // Signal UI to open color picker for the hue reference.
      themeController.setThemeOpenPickerContext(setState, 'picker:hue');
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick:
      // Signal UI to open eyedropper for the hue reference.
      themeController.setThemeOpenPickerContext(setState, 'eyedropper:hue');
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorPickerOnSelect:
      // Live preview: set hue reference in state (no persist).
      themeController.setThemeHueReferenceHex(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorPickerOnCommit:
      themeController.setThemeHueReferenceHex(setState, action.value);
      themeController.setThemeHueAdjustment(setState, 0);
      break;
    case ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick:
      // Bake hue shift into theme, save, set hueAdjustment to 0.
      themeController.recenterHueReference(setState, getState);
      break;
    case ThemeActionType.ThemePaletteHueSliderOnDelta:
      themeController.setThemeHueAdjustment(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteHueSliderOnCommit:
      themeController.setThemeHueAdjustment(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteClusterCountSliderOnDelta:
      themeController.setPaletteClusterCountKPreview(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePaletteClusterCountSliderOnCommit:
      themeController.setPaletteClusterCountK(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePaletteClusterGroupCheckboxOnToggle:
      themeController.setPaletteClusterGroupToggled(
        setState,
        getState,
        action.groupId,
        action.checked,
      );
      break;
    case ThemeActionType.ThemePaletteSwatchFullSelectCheckboxOnToggle:
      themeController.setPaletteFullSelection(
        setState,
        action.fullColorRefs,
        action.fullContrastRefs,
      );
      break;
    case ThemeActionType.ThemePaletteSwatchGroupSelectCheckboxOnToggle:
      themeController.setPaletteSwatchGroupSelection(
        setState,
        getState,
        action.refs,
        action.checked,
      );
      break;
    case ThemeActionType.ThemePalettePrimarySwatchButtonOnClick:
      themeController.setPalettePrimarySwatch(setState, getState, action.ref);
      break;
    case ThemeActionType.ThemePalettePrimarySwatchButtonOnDoubleClick:
      themeController.setPalettePrimarySwatch(setState, getState, action.ref);
      break;
    case ThemeActionType.ThemePalettePrimarySwatchButtonOnRightClick:
      // Context menu handled by UI; same as primary click.
      themeController.setPalettePrimarySwatch(setState, getState, action.ref);
      break;
    case ThemeActionType.ThemePaletteMemberSwatchButtonOnClick:
      themeController.setPaletteMemberSwatch(setState, getState, action.ref);
      break;
    case ThemeActionType.ThemePaletteMemberSwatchButtonOnRightClick:
      // Context menu handled by UI; no further state change needed.
      break;
    case ThemeActionType.ThemeVariablesSelectAllCheckboxOnToggle:
      themeController.setVariablesSelectAll(setState, getState, action.checked);
      break;
    case ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle:
      themeController.setVariablesSelectByType(
        setState,
        getState,
        action.checked,
        action.variableType,
      );
      break;
    case ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle:
      await themeController.setVariablesSelectByGroup(
        setState,
        getState,
        action.checked,
        action.groupId,
      );
      break;
    case ThemeActionType.ThemeVariablesSearchTextOnChange:
      themeController.setThemeVariablesSearchText(setState, action.value);
      break;
    case ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle:
      themeController.toggleVariableSelection(
        setState,
        getState,
        action.checked,
        action.ref,
      );
      break;
    case ThemeActionType.ThemeVariablesLightUseDarkCheckboxOnToggle:
      themeController.setContrastUseDarkForLight(
        setState,
        getState,
        action.ref,
        action.checked,
      );
      break;
    case ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle:
      themeController.setColorUseDarkForLight(setState, getState, action.ref, action.checked);
      break;
    case ThemeActionType.ThemeVariablesColorDarkTextOnChange:
      themeController.setThemeVariableDraftText(setState, `colorDark:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesColorDarkTextOnCommit:
      themeController.setColorVariableDark(setState, getState, action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesColorDarkColorButtonOnClick:
      themeController.setThemeOpenPickerContext(setState, `dark:${action.ref}`);
      break;
    case ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick:
      // Eyedropper is launched by the UI; this sets context so UI knows which ref is targeted.
      themeController.setThemeOpenPickerContext(setState, `eyedropper:dark:${action.ref}`);
      break;
    case ThemeActionType.ThemeVariablesColorDarkColorPickerOnSelect:
      themeController.setColorVariableFromHexPreview(
        setState,
        getState,
        action.ref,
        action.value,
        'dark',
      );
      break;
    case ThemeActionType.ThemeVariablesColorDarkColorPickerOnCommit:
      themeController.setColorVariableFromHex(
        setState,
        getState,
        action.ref,
        action.value,
        'dark',
      );
      break;
    case ThemeActionType.ThemeVariablesColorLightTextOnChange:
      themeController.setThemeVariableDraftText(setState, `colorLight:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesColorLightTextOnCommit:
      themeController.setColorVariableLight(setState, getState, action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesColorLightColorButtonOnClick:
      themeController.setThemeOpenPickerContext(setState, `light:${action.ref}`);
      break;
    case ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick:
      themeController.setThemeOpenPickerContext(setState, `eyedropper:light:${action.ref}`);
      break;
    case ThemeActionType.ThemeVariablesColorLightColorPickerOnSelect:
      themeController.setColorVariableFromHexPreview(
        setState,
        getState,
        action.ref,
        action.value,
        'light',
      );
      break;
    case ThemeActionType.ThemeVariablesColorLightColorPickerOnCommit:
      themeController.setColorVariableFromHex(
        setState,
        getState,
        action.ref,
        action.value,
        'light',
      );
      break;
    case ThemeActionType.ThemeVariablesContrastDarkValueTextOnChange:
      themeController.setThemeVariableDraftText(setState, `contrastDark:value:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit:
      themeController.setContrastVariableDarkValue(
        setState,
        getState,
        action.ref,
        action.value,
      );
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit:
      themeController.setContrastVariableDarkMethod(
        setState,
        getState,
        action.ref,
        action.value,
      );
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMinTextOnChange:
      themeController.setThemeVariableDraftText(setState, `contrastDark:min:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit:
      themeController.setContrastVariableDarkMin(setState, getState, action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMaxTextOnChange:
      themeController.setThemeVariableDraftText(setState, `contrastDark:max:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit:
      themeController.setContrastVariableDarkMax(setState, getState, action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightValueTextOnChange:
      themeController.setThemeVariableDraftText(setState, `contrastLight:value:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit:
      themeController.setContrastVariableLightValue(
        setState,
        getState,
        action.ref,
        action.value,
      );
      break;
    case ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit:
      themeController.setContrastVariableLightMethod(
        setState,
        getState,
        action.ref,
        action.value,
      );
      break;
    case ThemeActionType.ThemeVariablesContrastLightMinTextOnChange:
      themeController.setThemeVariableDraftText(setState, `contrastLight:min:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit:
      themeController.setContrastVariableLightMin(setState, getState, action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightMaxTextOnChange:
      themeController.setThemeVariableDraftText(setState, `contrastLight:max:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit:
      themeController.setContrastVariableLightMax(setState, getState, action.ref, action.value);
      break;
    case ThemeActionType.ThemePreviewVariableListOnCommit:
      // Set the selected variable for preview in theme UI state.
      // Update UI state so the preview pane shows the selected variable's usage.
      themeController.setPreviewVariableSelection(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePreviewVariableFilterTextOnChange:
      // Store the preview variable filter text in theme UI state (filter is derived for display).
      // Update UI state so the preview variable list is filtered.
      themeController.setPreviewVariableFilterText(setState, action.value);
      break;
    case ThemeActionType.ThemePreviewVariableFilterClearOnClick:
      // Clear the preview variable filter text in theme UI state.
      // Update UI state so the filter is cleared and the full list is shown.
      themeController.clearPreviewVariableFilter(setState);
      break;
    case ThemeActionType.ThemePreviewSampleButtonOnClick:
      // Insert or refresh the preview sample content in theme UI state (or from disk).
      // Update UI state so the preview pane shows the sample.
      themeController.previewSampleButtonScroll(setState);
      break;
    case ThemeActionType.ThemePreviewSampleListOnCommit:
      // Set the selected sample for preview in theme UI state.
      // Update UI state so the preview pane shows the selected sample.
      themeController.setPreviewSelectedSample(setState, action.value);
      break;
  }
};
