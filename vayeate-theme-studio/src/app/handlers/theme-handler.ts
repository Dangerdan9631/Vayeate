import * as themeController from '../../domain/controllers/theme-controller';
import type { ActionHandler, HandlerDeps, ThemeAction } from './handler-types';
import { ThemeActionType } from '../actions/action-types';
import { container } from 'tsyringe';

export const handleThemeAction: ActionHandler<ThemeAction> = async (
  action: ThemeAction,
  { setState, getState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case ThemeActionType.ThemePageOnLoad:
      await container.resolve(themeController.LoadThemePageController).run();
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
      await container.resolve(themeController.CreateThemeController).run(action.params);
      break;
    case ThemeActionType.ThemeDetailsDeleteVersionButtonOnClick:
      await container.resolve(themeController.DeleteThemeVersionController).run(action.name, action.version);
      break;
    case ThemeActionType.ThemeDetailsIncrementVersionButtonOnClick:
      await container.resolve(themeController.IncrementThemeVersionController).run();
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
      themeController.setApplyPaletteToDark(setState, getState, action.checked);
      break;
    case ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle:
      themeController.setApplyPaletteToLight(setState, getState, action.checked);
      break;
    case ThemeActionType.ThemePaletteAssignColorTextOnChange:
      themeController.setAssignColorDraftText(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorTextOnCommit:
      themeController.commitAssignColorText(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorButtonOnClick:
      themeController.applyAssignColorDraft(setState, getState);
      break;
    case ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick:
      themeController.setThemeOpenPickerContext(setState, `eyedropper:assign:${action.colorRef}`);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnSelect:
      themeController.setAssignColorPreview(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnCommit:
      themeController.assignColorFromPicker(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnClose:
      themeController.persistCurrentTheme(setState, getState);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorTextOnChange:
      themeController.setThemeHueReferenceHex(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorTextOnCommit:
      themeController.commitHueReferenceColor(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorButtonOnClick:
      themeController.setThemeOpenPickerContext(setState, 'picker:hue');
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick:
      themeController.setThemeOpenPickerContext(setState, 'eyedropper:hue');
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorPickerOnSelect:
      themeController.setThemeHueReferenceHex(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorPickerOnCommit:
      themeController.commitHueReferenceColor(setState, action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick:
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
      themeController.setPalettePrimarySwatch(setState, getState, action.ref);
      break;
    case ThemeActionType.ThemePaletteMemberSwatchButtonOnClick:
      themeController.setPaletteMemberSwatch(setState, getState, action.ref);
      break;
    case ThemeActionType.ThemePaletteMemberSwatchButtonOnRightClick:
      themeController.handleMemberSwatchRightClick(setState, getState, action.ref);
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
      themeController.setPreviewVariableSelection(setState, getState, action.value);
      break;
    case ThemeActionType.ThemePreviewVariableFilterTextOnChange:
      themeController.setPreviewVariableFilterText(setState, action.value);
      break;
    case ThemeActionType.ThemePreviewVariableFilterClearOnClick:
      themeController.clearPreviewVariableFilter(setState);
      break;
    case ThemeActionType.ThemePreviewSampleButtonOnClick:
      themeController.previewSampleButtonScroll(setState);
      break;
    case ThemeActionType.ThemePreviewSampleListOnCommit:
      themeController.setPreviewSelectedSample(setState, action.value);
      break;
  }
};
