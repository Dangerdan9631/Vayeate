import { singleton } from 'tsyringe';
import { OpenEyedropperOverlayController } from '../controllers/open-eyedropper-overlay-controller';
import { AssignColorFromPickerController } from '../controllers/assign-color-from-picker-controller';
import { SetAssignColorPreviewController } from '../controllers/set-assign-color-preview-controller';
import { CommitHueReferenceColorController } from '../controllers/commit-hue-reference-color-controller';
import { RecenterHueReferenceController } from '../controllers/recenter-hue-reference-controller';
import { SetThemeHueAdjustmentController } from '../controllers/set-theme-hue-adjustment-controller';
import { SetApplyPaletteToDarkController } from '../controllers/set-apply-palette-to-dark-controller';
import { SetApplyPaletteToLightController } from '../controllers/set-apply-palette-to-light-controller';
import { SetPaletteClusterCountKController } from '../controllers/set-palette-cluster-count-k-controller';
import { SetPaletteClusterCountKPreviewController } from '../controllers/set-palette-cluster-count-k-preview-controller';
import { ClearThemeSaveErrorController } from '../controllers/clear-theme-save-error-controller';
import { GenerateThemeController } from '../controllers/generate-theme-controller';
import { IncrementThemeVersionController } from '../controllers/increment-theme-version-controller';
import { PersistCurrentThemeController } from '../controllers/persist-current-theme-controller';
import { SetThemePreviewTokenRefController } from '../controllers/set-theme-preview-token-ref-controller';
import { SetThemeTemplateController } from '../controllers/set-theme-template-controller';
import { CloseThemeCreateDialogController } from '../controllers/close-theme-create-dialog-controller';
import { CreateThemeController } from '../controllers/create-theme-controller';
import { DeleteThemeVersionController } from '../controllers/delete-theme-version-controller';
import { LoadThemePageController } from '../../common/controllers/load-theme-page-controller';
import { LoadThemePreviewsController } from '../../common/controllers/load-theme-previews-controller';
import { OpenThemeCreateDialogController } from '../controllers/open-theme-create-dialog-controller';
import { SelectThemeAndLoadController } from '../controllers/select-theme-and-load-controller';
import { SelectThemeByNameController } from '../controllers/select-theme-by-name-controller';
import { SetThemeCreateFormNameController } from '../controllers/set-theme-create-form-name-controller';
import { SetColorRefsSelectionBatchController } from '../controllers/set-color-refs-selection-batch-controller';
import { SetThemeVariablesSearchTextController } from '../controllers/set-theme-variables-search-text-controller';
import { SetVariablesSelectAllController } from '../controllers/set-variables-select-all-controller';
import { SetVariablesSelectByGroupController } from '../controllers/set-variables-select-by-group-controller';
import { SetVariablesSelectByTypeController } from '../controllers/set-variables-select-by-type-controller';
import { ToggleVariableSelectionController } from '../controllers/toggle-variable-selection-controller';
import { SetColorUseDarkForLightController } from '../controllers/set-color-use-dark-for-light-controller';
import { SetColorVariableDarkController } from '../controllers/set-color-variable-dark-controller';
import { SetColorVariableLightController } from '../controllers/set-color-variable-light-controller';
import { SetContrastUseDarkForLightController } from '../controllers/set-contrast-use-dark-for-light-controller';
import { SetContrastVariableDarkMaxController } from '../controllers/set-contrast-variable-dark-max-controller';
import { SetContrastVariableDarkMethodController } from '../controllers/set-contrast-variable-dark-method-controller';
import { SetContrastVariableDarkMinController } from '../controllers/set-contrast-variable-dark-min-controller';
import { SetContrastVariableDarkValueController } from '../controllers/set-contrast-variable-dark-value-controller';
import { SetContrastVariableLightMaxController } from '../controllers/set-contrast-variable-light-max-controller';
import { SetContrastVariableLightMethodController } from '../controllers/set-contrast-variable-light-method-controller';
import { SetContrastVariableLightMinController } from '../controllers/set-contrast-variable-light-min-controller';
import { SetContrastVariableLightValueController } from '../controllers/set-contrast-variable-light-value-controller';
import { ThemeActions, ThemeActionType } from './theme-action-type';

@singleton()
export class ThemeActionHandler {
  constructor(
    private readonly assignColorFromPicker: AssignColorFromPickerController,
    private readonly clearThemeSaveError: ClearThemeSaveErrorController,
    private readonly closeThemeCreateDialog: CloseThemeCreateDialogController,
    private readonly createTheme: CreateThemeController,
    private readonly deleteThemeVersion: DeleteThemeVersionController,
    private readonly generateTheme: GenerateThemeController,
    private readonly incrementThemeVersion: IncrementThemeVersionController,
    private readonly loadThemePage: LoadThemePageController,
    private readonly loadThemePreviews: LoadThemePreviewsController,
    private readonly openEyedropperOverlay: OpenEyedropperOverlayController,
    private readonly openThemeCreateDialog: OpenThemeCreateDialogController,
    private readonly persistCurrentTheme: PersistCurrentThemeController,
    private readonly recenterHueReference: RecenterHueReferenceController,
    private readonly selectThemeAndLoad: SelectThemeAndLoadController,
    private readonly selectThemeByName: SelectThemeByNameController,
    private readonly setApplyPaletteToDark: SetApplyPaletteToDarkController,
    private readonly setApplyPaletteToLight: SetApplyPaletteToLightController,
    private readonly setAssignColorPreview: SetAssignColorPreviewController,
    private readonly setColorUseDarkForLight: SetColorUseDarkForLightController,
    private readonly setColorVariableDark: SetColorVariableDarkController,
    private readonly setColorVariableLight: SetColorVariableLightController,
    private readonly setContrastUseDarkForLight: SetContrastUseDarkForLightController,
    private readonly setContrastVariableDarkMax: SetContrastVariableDarkMaxController,
    private readonly setContrastVariableDarkMethod: SetContrastVariableDarkMethodController,
    private readonly setContrastVariableDarkMin: SetContrastVariableDarkMinController,
    private readonly setContrastVariableDarkValue: SetContrastVariableDarkValueController,
    private readonly setContrastVariableLightMax: SetContrastVariableLightMaxController,
    private readonly setContrastVariableLightMethod: SetContrastVariableLightMethodController,
    private readonly setContrastVariableLightMin: SetContrastVariableLightMinController,
    private readonly setContrastVariableLightValue: SetContrastVariableLightValueController,
    private readonly setPaletteClusterCountK: SetPaletteClusterCountKController,
    private readonly setPaletteClusterCountKPreview: SetPaletteClusterCountKPreviewController,
    private readonly setThemeCreateFormName: SetThemeCreateFormNameController,
    private readonly commitHueReferenceColor: CommitHueReferenceColorController,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentController,
    private readonly setColorRefsSelectionBatch: SetColorRefsSelectionBatchController,
    private readonly setThemePreviewTokenRef: SetThemePreviewTokenRefController,
    private readonly setThemeTemplate: SetThemeTemplateController,
    private readonly setThemeVariablesSearchText: SetThemeVariablesSearchTextController,
    private readonly setVariablesSelectAll: SetVariablesSelectAllController,
    private readonly setVariablesSelectByGroup: SetVariablesSelectByGroupController,
    private readonly setVariablesSelectByType: SetVariablesSelectByTypeController,
    private readonly toggleVariableSelection: ToggleVariableSelectionController,
  ) {}

  async handle(action: ThemeActions): Promise<void> {
    switch (action.type) {
      case ThemeActionType.ThemePageOnLoad:
        await this.loadThemePage.run();
        break;
      case ThemeActionType.ThemePagePreviewsOnLoad:
        await this.loadThemePreviews.run();
        break;
      case ThemeActionType.ThemePageSaveErrorDismissButtonOnClick:
        await this.clearThemeSaveError.run();
        break;
      case ThemeActionType.ThemeThemesNameListOnCommit:
        await this.selectThemeByName.run(action.name);
        break;
      case ThemeActionType.ThemeThemesVersionListOnCommit:
        await this.selectThemeAndLoad.run(action.name, action.version);
        break;
      case ThemeActionType.ThemeThemesCreateButtonOnClick:
        await this.openThemeCreateDialog.run();
        break;
      case ThemeActionType.ThemeCreateDialogNameTextOnChange:
        await this.setThemeCreateFormName.run(action.value);
        break;
      case ThemeActionType.ThemeCreateDialogCancelButtonOnClick:
        await this.closeThemeCreateDialog.run();
        break;
      case ThemeActionType.ThemeCreateDialogOkButtonOnClick:
        await this.createTheme.run(action.params);
        break;
      case ThemeActionType.ThemeDetailsTemplateListOnCommit:
        await this.setThemeTemplate.run(action.name, action.version);
        break;
      case ThemeActionType.ThemeDetailsTemplateVersionListOnCommit:
        await this.setThemeTemplate.run(action.name, action.version);
        break;
      case ThemeActionType.ThemeDetailsDeleteVersionButtonOnClick:
        await this.deleteThemeVersion.run(action.name, action.version);
        break;
      case ThemeActionType.ThemeDetailsIncrementVersionButtonOnClick:
        await this.incrementThemeVersion.run();
        break;
      case ThemeActionType.ThemeDetailsGenerateButtonOnClick:
        await this.generateTheme.run();
        break;
      case ThemeActionType.ThemePaletteApplyToDarkCheckboxOnToggle:
        await this.setApplyPaletteToDark.run(action.checked);
        break;
      case ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle:
        await this.setApplyPaletteToLight.run(action.checked);
        break;
      case ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run(`eyedropper:assign:${action.colorRef}`);
        break;
      case ThemeActionType.ThemePaletteAssignColorPickerOnSelect:
        await this.setAssignColorPreview.run(action.value);
        break;
      case ThemeActionType.ThemePaletteAssignColorPickerOnCommit:
        await this.assignColorFromPicker.run(action.value);
        break;
      case ThemeActionType.ThemePaletteAssignColorPickerOnClose:
        await this.persistCurrentTheme.run();
        break;
      case ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick:
        await this.recenterHueReference.run();
        break;
      case ThemeActionType.ThemePaletteHueReferenceCommit:
        await this.commitHueReferenceColor.run(action.value);
        break;
      case ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run('eyedropper:hue');
        break;
      case ThemeActionType.ThemePaletteHueSliderOnDelta:
        await this.setThemeHueAdjustment.run(action.value);
        break;
      case ThemeActionType.ThemePaletteClusterCountSliderOnDelta:
        await this.setPaletteClusterCountKPreview.run(action.value);
        break;
      case ThemeActionType.ThemePaletteClusterCountSliderOnCommit:
        await this.setPaletteClusterCountK.run(action.value);
        break;
      case ThemeActionType.ThemeVariablesSearchTextOnChange:
        await this.setThemeVariablesSearchText.run(action.value);
        break;
      case ThemeActionType.ThemeVariablesSelectAllCheckboxOnToggle:
        await this.setVariablesSelectAll.run(action.checked);
        break;
      case ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle:
        await this.setVariablesSelectByType.run(action.checked, action.variableType);
        break;
      case ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle:
        await this.setVariablesSelectByGroup.run(action.checked, action.groupId);
        break;
      case ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle:
        await this.toggleVariableSelection.run(action.checked, action.ref);
        break;
      case ThemeActionType.ThemePaletteColorRefsSelectionCommit:
        await this.setColorRefsSelectionBatch.run(action.refs, action.checked);
        break;
      case ThemeActionType.ThemeVariablesColorDarkTextOnCommit:
        await this.setColorVariableDark.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run(`eyedropper:dark:${action.ref}`);
        break;
      case ThemeActionType.ThemeVariablesColorLightTextOnCommit:
        await this.setColorVariableLight.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run(`eyedropper:light:${action.ref}`);
        break;
      case ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle:
        await this.setColorUseDarkForLight.run(action.ref, action.checked);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit:
        await this.setContrastVariableDarkValue.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit:
        await this.setContrastVariableDarkMethod.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit:
        await this.setContrastVariableDarkMin.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit:
        await this.setContrastVariableDarkMax.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit:
        await this.setContrastVariableLightValue.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit:
        await this.setContrastVariableLightMethod.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit:
        await this.setContrastVariableLightMin.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit:
        await this.setContrastVariableLightMax.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastUseDarkForLightCheckboxOnToggle:
        await this.setContrastUseDarkForLight.run(action.ref, action.checked);
        break;
      case ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit:
        await this.setThemePreviewTokenRef.run(action.tokenRefField, action.value);
        break;
    }
  }
}
