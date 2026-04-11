import { singleton } from 'tsyringe';
import { OpenEyedropperOverlayController } from '../../../domain/controllers/theme-controller/eyedropper/open-eyedropper-overlay-controller';
import { AssignColorFromPickerController } from '../../../domain/controllers/theme-controller/palette-color-assign/assign-color-from-picker-controller';
import { SetAssignColorPreviewController } from '../../../domain/controllers/theme-controller/palette-color-assign/set-assign-color-preview-controller';
import { CommitHueReferenceColorController } from '../../../domain/controllers/theme-controller/palette-hue/commit-hue-reference-color-controller';
import { RecenterHueReferenceController } from '../../../domain/controllers/theme-controller/palette-hue/recenter-hue-reference-controller';
import { SetThemeHueAdjustmentController } from '../../../domain/controllers/theme-controller/palette-hue/set-theme-hue-adjustment-controller';
import { SetApplyPaletteToDarkController } from '../../../domain/controllers/theme-controller/palette/set-apply-palette-to-dark-controller';
import { SetApplyPaletteToLightController } from '../../../domain/controllers/theme-controller/palette/set-apply-palette-to-light-controller';
import { SetPaletteClusterCountKController } from '../../../domain/controllers/theme-controller/palette/set-palette-cluster-count-k-controller';
import { SetPaletteClusterCountKPreviewController } from '../../../domain/controllers/theme-controller/palette/set-palette-cluster-count-k-preview-controller';
import { ClearThemeSaveErrorController } from '../../../domain/controllers/theme-controller/theme-details/clear-theme-save-error-controller';
import { GenerateThemeController } from '../../../domain/controllers/theme-controller/theme-details/generate-theme-controller';
import { IncrementThemeVersionController } from '../../../domain/controllers/theme-controller/theme-details/increment-theme-version-controller';
import { PersistCurrentThemeController } from '../../../domain/controllers/theme-controller/theme-details/persist-current-theme-controller';
import { SetThemePreviewTokenRefController } from '../../../domain/controllers/theme-controller/theme-details/set-theme-preview-token-ref-controller';
import { SetThemeTemplateController } from '../../../domain/controllers/theme-controller/theme-details/set-theme-template-controller';
import { CloseThemeCreateDialogController } from '../../../domain/controllers/theme-controller/theme-list/close-theme-create-dialog-controller';
import { CreateThemeController } from '../../../domain/controllers/theme-controller/theme-list/create-theme-controller';
import { DeleteThemeVersionController } from '../../../domain/controllers/theme-controller/theme-list/delete-theme-version-controller';
import { LoadThemePageController } from '../../../domain/controllers/theme-controller/theme-list/load-theme-page-controller';
import { OpenThemeCreateDialogController } from '../../../domain/controllers/theme-controller/theme-list/open-theme-create-dialog-controller';
import { SelectThemeAndLoadController } from '../../../domain/controllers/theme-controller/theme-list/select-theme-and-load-controller';
import { SelectThemeByNameController } from '../../../domain/controllers/theme-controller/theme-list/select-theme-by-name-controller';
import { SetThemeCreateFormNameController } from '../../../domain/controllers/theme-controller/theme-list/set-theme-create-form-name-controller';
import { SetColorRefsSelectionBatchController } from '../../../domain/controllers/theme-controller/variables/set-color-refs-selection-batch-controller';
import { SetThemeVariablesSearchTextController } from '../../../domain/controllers/theme-controller/variables/set-theme-variables-search-text-controller';
import { SetVariablesSelectAllController } from '../../../domain/controllers/theme-controller/variables/set-variables-select-all-controller';
import { SetVariablesSelectByGroupController } from '../../../domain/controllers/theme-controller/variables/set-variables-select-by-group-controller';
import { SetVariablesSelectByTypeController } from '../../../domain/controllers/theme-controller/variables/set-variables-select-by-type-controller';
import { ToggleVariableSelectionController } from '../../../domain/controllers/theme-controller/variables/toggle-variable-selection-controller';
import { SetColorUseDarkForLightController } from '../../../domain/controllers/theme-controller/variables-color/set-color-use-dark-for-light-controller';
import { SetColorVariableDarkController } from '../../../domain/controllers/theme-controller/variables-color/set-color-variable-dark-controller';
import { SetColorVariableLightController } from '../../../domain/controllers/theme-controller/variables-color/set-color-variable-light-controller';
import { SetContrastUseDarkForLightController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-use-dark-for-light-controller';
import { SetContrastVariableDarkMaxController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-variable-dark-max-controller';
import { SetContrastVariableDarkMethodController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-variable-dark-method-controller';
import { SetContrastVariableDarkMinController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-variable-dark-min-controller';
import { SetContrastVariableDarkValueController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-variable-dark-value-controller';
import { SetContrastVariableLightMaxController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-variable-light-max-controller';
import { SetContrastVariableLightMethodController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-variable-light-method-controller';
import { SetContrastVariableLightMinController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-variable-light-min-controller';
import { SetContrastVariableLightValueController } from '../../../domain/controllers/theme-controller/variables-contrast/set-contrast-variable-light-value-controller';
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
      case ThemeActionType.ThemePageSaveErrorDismissButtonOnClick:
        this.clearThemeSaveError.run();
        break;
      case ThemeActionType.ThemeThemesNameListOnCommit:
        await this.selectThemeByName.run(action.name);
        break;
      case ThemeActionType.ThemeThemesVersionListOnCommit:
        await this.selectThemeAndLoad.run(action.name, action.version);
        break;
      case ThemeActionType.ThemeThemesCreateButtonOnClick:
        this.openThemeCreateDialog.run();
        break;
      case ThemeActionType.ThemeCreateDialogNameTextOnChange:
        this.setThemeCreateFormName.run(action.value);
        break;
      case ThemeActionType.ThemeCreateDialogCancelButtonOnClick:
        this.closeThemeCreateDialog.run();
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
        this.setApplyPaletteToDark.run(action.checked);
        break;
      case ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle:
        this.setApplyPaletteToLight.run(action.checked);
        break;
      case ThemeActionType.ThemePaletteAssignColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run(`eyedropper:assign:${action.colorRef}`);
        break;
      case ThemeActionType.ThemePaletteAssignColorPickerOnSelect:
        this.setAssignColorPreview.run(action.value);
        break;
      case ThemeActionType.ThemePaletteAssignColorPickerOnCommit:
        this.assignColorFromPicker.run(action.value);
        break;
      case ThemeActionType.ThemePaletteAssignColorPickerOnClose:
        this.persistCurrentTheme.run();
        break;
      case ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick:
        this.recenterHueReference.run();
        break;
      case ThemeActionType.ThemePaletteHueReferenceCommit:
        this.commitHueReferenceColor.run(action.value);
        break;
      case ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run('eyedropper:hue');
        break;
      case ThemeActionType.ThemePaletteHueSliderOnDelta:
        this.setThemeHueAdjustment.run(action.value);
        break;
      case ThemeActionType.ThemePaletteClusterCountSliderOnDelta:
        this.setPaletteClusterCountKPreview.run(action.value);
        break;
      case ThemeActionType.ThemePaletteClusterCountSliderOnCommit:
        this.setPaletteClusterCountK.run(action.value);
        break;
      case ThemeActionType.ThemeVariablesSearchTextOnChange:
        this.setThemeVariablesSearchText.run(action.value);
        break;
      case ThemeActionType.ThemeVariablesSelectAllCheckboxOnToggle:
        this.setVariablesSelectAll.run(action.checked);
        break;
      case ThemeActionType.ThemeVariablesSelectVariableTypeCheckboxOnToggle:
        this.setVariablesSelectByType.run(action.checked, action.variableType);
        break;
      case ThemeActionType.ThemeVariablesSelectVariableGroupCheckboxOnToggle:
        await this.setVariablesSelectByGroup.run(action.checked, action.groupId);
        break;
      case ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle:
        this.toggleVariableSelection.run(action.checked, action.ref);
        break;
      case ThemeActionType.ThemePaletteColorRefsSelectionCommit:
        this.setColorRefsSelectionBatch.run(action.refs, action.checked);
        break;
      case ThemeActionType.ThemeVariablesColorDarkTextOnCommit:
        this.setColorVariableDark.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run(`eyedropper:dark:${action.ref}`);
        break;
      case ThemeActionType.ThemeVariablesColorLightTextOnCommit:
        this.setColorVariableLight.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run(`eyedropper:light:${action.ref}`);
        break;
      case ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle:
        this.setColorUseDarkForLight.run(action.ref, action.checked);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit:
        this.setContrastVariableDarkValue.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit:
        this.setContrastVariableDarkMethod.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit:
        this.setContrastVariableDarkMin.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit:
        this.setContrastVariableDarkMax.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit:
        this.setContrastVariableLightValue.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit:
        this.setContrastVariableLightMethod.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit:
        this.setContrastVariableLightMin.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit:
        this.setContrastVariableLightMax.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastUseDarkForLightCheckboxOnToggle:
        this.setContrastUseDarkForLight.run(action.ref, action.checked);
        break;
      case ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit:
        this.setThemePreviewTokenRef.run(action.tokenRefField, action.value);
        break;
    }
  }
}
