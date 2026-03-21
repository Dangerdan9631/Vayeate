import * as themeController from '../../domain/controllers/theme-controller';
import type { ActionHandler, HandlerDeps, ThemeAction } from './handler-types';
import { ThemeActionType } from '../actions/action-types';
import { container } from 'tsyringe';

export const handleThemeAction: ActionHandler<ThemeAction> = async (
  action: ThemeAction,
  _deps: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case ThemeActionType.ThemePageOnLoad:
      await container.resolve(themeController.LoadThemePageController).run();
      break;
    case ThemeActionType.ThemePageSaveErrorDismissButtonOnClick:
      container.resolve(themeController.ClearThemeSaveErrorController).run();
      break;
    case ThemeActionType.ThemeThemesNameListOnCommit:
      await container.resolve(themeController.SelectThemeByNameController).run(action.name);
      break;
    case ThemeActionType.ThemeThemesVersionListOnCommit:
      await container
        .resolve(themeController.SelectThemeAndLoadController)
        .run(action.name, action.version);
      break;
    case ThemeActionType.ThemeThemesCreateButtonOnClick:
      container.resolve(themeController.OpenThemeCreateDialogController).run();
      break;
    case ThemeActionType.ThemeCreateDialogOnOpen:
      container.resolve(themeController.OpenThemeCreateDialogController).run();
      break;
    case ThemeActionType.ThemeCreateDialogNameTextOnChange:
      container.resolve(themeController.SetThemeCreateFormNameController).run(action.value);
      break;
    case ThemeActionType.ThemeCreateDialogCancelButtonOnClick:
      container.resolve(themeController.CloseThemeCreateDialogController).run();
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
      await container
        .resolve(themeController.GenerateThemeController)
        .run(
          action.themeName,
          action.themeVersion,
          action.templateName,
          action.templateVersion,
        );
      break;
    case ThemeActionType.ThemeDetailsTemplateListOnCommit:
      await container
        .resolve(themeController.SetThemeTemplateController)
        .run(action.name, action.version);
      break;
    case ThemeActionType.ThemeDetailsTemplateVersionListOnCommit:
      await container
        .resolve(themeController.SetThemeTemplateController)
        .run(action.name, action.version);
      break;
    case ThemeActionType.ThemeDetailsCatalogCheckboxOnToggle:
      container.resolve(themeController.SetThemeTemplateToggleController).run(action.checked);
      break;
    case ThemeActionType.ThemeDetailsCatalogVersionListOnCommit:
      await container.resolve(themeController.SetThemeTemplateVersionOnlyController).run(action.value);
      break;
    case ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit:
      container
        .resolve(themeController.SetThemePreviewTokenRefController)
        .run(action.tokenRefField, action.value);
      break;
    case ThemeActionType.ThemePaletteApplyToDarkCheckboxOnToggle:
      container.resolve(themeController.SetApplyPaletteToDarkController).run(action.checked);
      break;
    case ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle:
      container.resolve(themeController.SetApplyPaletteToLightController).run(action.checked);
      break;
    case ThemeActionType.ThemePaletteAssignColorTextOnChange:
      container.resolve(themeController.SetAssignColorDraftTextController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorTextOnCommit:
      container
        .resolve(themeController.CommitAssignColorTextController)
        .run(action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorButtonOnClick:
      container.resolve(themeController.ApplyAssignColorDraftController).run();
      break;
    case ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick:
      container
        .resolve(themeController.SetThemeOpenPickerContextController)
        .run(`eyedropper:assign:${action.colorRef}`);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnSelect:
      container
        .resolve(themeController.SetAssignColorPreviewController)
        .run(action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnCommit:
      container.resolve(themeController.AssignColorFromPickerController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteAssignColorPickerOnClose:
      container.resolve(themeController.PersistCurrentThemeController).run();
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorTextOnChange:
      container.resolve(themeController.SetThemeHueReferenceHexController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorTextOnCommit:
      container.resolve(themeController.CommitHueReferenceColorController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorButtonOnClick:
      container.resolve(themeController.SetThemeOpenPickerContextController).run('picker:hue');
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick:
      container.resolve(themeController.SetThemeOpenPickerContextController).run('eyedropper:hue');
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorPickerOnSelect:
      container.resolve(themeController.SetThemeHueReferenceHexController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceColorPickerOnCommit:
      container.resolve(themeController.CommitHueReferenceColorController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick:
      container.resolve(themeController.RecenterHueReferenceController).run();
      break;
    case ThemeActionType.ThemePaletteHueSliderOnDelta:
      container.resolve(themeController.SetThemeHueAdjustmentController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteHueSliderOnCommit:
      container.resolve(themeController.SetThemeHueAdjustmentController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteClusterCountSliderOnDelta:
      container
        .resolve(themeController.SetPaletteClusterCountKPreviewController)
        .run(action.value);
      break;
    case ThemeActionType.ThemePaletteClusterCountSliderOnCommit:
      container.resolve(themeController.SetPaletteClusterCountKController).run(action.value);
      break;
    case ThemeActionType.ThemePaletteClusterGroupCheckboxOnToggle:
      container
        .resolve(themeController.SetPaletteClusterGroupToggledController)
        .run(action.groupId, action.checked);
      break;
    case ThemeActionType.ThemePaletteSwatchFullSelectCheckboxOnToggle:
      container
        .resolve(themeController.SetPaletteFullSelectionController)
        .run(action.fullColorRefs, action.fullContrastRefs);
      break;
    case ThemeActionType.ThemePaletteSwatchGroupSelectCheckboxOnToggle:
      container
        .resolve(themeController.SetPaletteSwatchGroupSelectionController)
        .run(action.refs, action.checked);
      break;
    case ThemeActionType.ThemePalettePrimarySwatchButtonOnClick:
      container.resolve(themeController.SetPalettePrimarySwatchController).run(action.ref);
      break;
    case ThemeActionType.ThemePalettePrimarySwatchButtonOnDoubleClick:
      container.resolve(themeController.SetPalettePrimarySwatchController).run(action.ref);
      break;
    case ThemeActionType.ThemePalettePrimarySwatchButtonOnRightClick:
      container.resolve(themeController.SetPalettePrimarySwatchController).run(action.ref);
      break;
    case ThemeActionType.ThemePaletteMemberSwatchButtonOnClick:
      container.resolve(themeController.SetPaletteMemberSwatchController).run(action.ref);
      break;
    case ThemeActionType.ThemePaletteMemberSwatchButtonOnRightClick:
      container.resolve(themeController.HandleMemberSwatchRightClickController).run(action.ref);
      break;
    case ThemeActionType.ThemeVariablesSelectAllCheckboxOnToggle:
      container.resolve(themeController.SetVariablesSelectAllController).run(action.checked);
      break;
    case ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle:
      container
        .resolve(themeController.SetVariablesSelectByTypeController)
        .run(action.checked, action.variableType);
      break;
    case ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle:
      await container
        .resolve(themeController.SetVariablesSelectByGroupController)
        .run(action.checked, action.groupId);
      break;
    case ThemeActionType.ThemeVariablesSearchTextOnChange:
      container.resolve(themeController.SetThemeVariablesSearchTextController).run(action.value);
      break;
    case ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle:
      container
        .resolve(themeController.ToggleVariableSelectionController)
        .run(action.checked, action.ref);
      break;
    case ThemeActionType.ThemeVariablesLightUseDarkCheckboxOnToggle:
      container
        .resolve(themeController.SetContrastUseDarkForLightController)
        .run(action.ref, action.checked);
      break;
    case ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle:
      container
        .resolve(themeController.SetColorUseDarkForLightController)
        .run(action.ref, action.checked);
      break;
    case ThemeActionType.ThemeVariablesColorDarkTextOnChange:
      container
        .resolve(themeController.SetThemeVariableDraftTextController)
        .run(`colorDark:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesColorDarkTextOnCommit:
      container
        .resolve(themeController.SetColorVariableDarkController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesColorDarkColorButtonOnClick:
      container.resolve(themeController.SetThemeOpenPickerContextController).run(`dark:${action.ref}`);
      break;
    case ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick:
      container
        .resolve(themeController.SetThemeOpenPickerContextController)
        .run(`eyedropper:dark:${action.ref}`);
      break;
    case ThemeActionType.ThemeVariablesColorDarkColorPickerOnSelect:
      container
        .resolve(themeController.SetColorVariableFromHexPreviewController)
        .run(action.ref, action.value, 'dark');
      break;
    case ThemeActionType.ThemeVariablesColorDarkColorPickerOnCommit:
      container
        .resolve(themeController.SetColorVariableFromHexController)
        .run(action.ref, action.value, 'dark');
      break;
    case ThemeActionType.ThemeVariablesColorLightTextOnChange:
      container
        .resolve(themeController.SetThemeVariableDraftTextController)
        .run(`colorLight:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesColorLightTextOnCommit:
      container
        .resolve(themeController.SetColorVariableLightController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesColorLightColorButtonOnClick:
      container
        .resolve(themeController.SetThemeOpenPickerContextController)
        .run(`light:${action.ref}`);
      break;
    case ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick:
      container
        .resolve(themeController.SetThemeOpenPickerContextController)
        .run(`eyedropper:light:${action.ref}`);
      break;
    case ThemeActionType.ThemeVariablesColorLightColorPickerOnSelect:
      container
        .resolve(themeController.SetColorVariableFromHexPreviewController)
        .run(action.ref, action.value, 'light');
      break;
    case ThemeActionType.ThemeVariablesColorLightColorPickerOnCommit:
      container
        .resolve(themeController.SetColorVariableFromHexController)
        .run(action.ref, action.value, 'light');
      break;
    case ThemeActionType.ThemeVariablesContrastDarkValueTextOnChange:
      container
        .resolve(themeController.SetThemeVariableDraftTextController)
        .run(`contrastDark:value:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit:
      container
        .resolve(themeController.SetContrastVariableDarkValueController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit:
      container
        .resolve(themeController.SetContrastVariableDarkMethodController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMinTextOnChange:
      container
        .resolve(themeController.SetThemeVariableDraftTextController)
        .run(`contrastDark:min:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit:
      container
        .resolve(themeController.SetContrastVariableDarkMinController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMaxTextOnChange:
      container
        .resolve(themeController.SetThemeVariableDraftTextController)
        .run(`contrastDark:max:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit:
      container
        .resolve(themeController.SetContrastVariableDarkMaxController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightValueTextOnChange:
      container
        .resolve(themeController.SetThemeVariableDraftTextController)
        .run(`contrastLight:value:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit:
      container
        .resolve(themeController.SetContrastVariableLightValueController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit:
      container
        .resolve(themeController.SetContrastVariableLightMethodController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightMinTextOnChange:
      container
        .resolve(themeController.SetThemeVariableDraftTextController)
        .run(`contrastLight:min:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit:
      container
        .resolve(themeController.SetContrastVariableLightMinController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightMaxTextOnChange:
      container
        .resolve(themeController.SetThemeVariableDraftTextController)
        .run(`contrastLight:max:${action.ref}`, action.value);
      break;
    case ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit:
      container
        .resolve(themeController.SetContrastVariableLightMaxController)
        .run(action.ref, action.value);
      break;
    case ThemeActionType.ThemePreviewVariableListOnCommit:
      container
        .resolve(themeController.SetPreviewVariableSelectionController)
        .run(action.value);
      break;
    case ThemeActionType.ThemePreviewVariableFilterTextOnChange:
      container
        .resolve(themeController.SetPreviewVariableFilterTextController)
        .run(action.value);
      break;
    case ThemeActionType.ThemePreviewVariableFilterClearOnClick:
      container.resolve(themeController.ClearPreviewVariableFilterController).run();
      break;
    case ThemeActionType.ThemePreviewSampleButtonOnClick:
      container.resolve(themeController.PreviewSampleButtonScrollController).run();
      break;
    case ThemeActionType.ThemePreviewSampleListOnCommit:
      container.resolve(themeController.SetPreviewSelectedSampleController).run(action.value);
      break;
  }
};
