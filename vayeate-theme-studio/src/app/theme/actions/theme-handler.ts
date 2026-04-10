import { injectable } from 'tsyringe';
import {
  AssignColorFromPickerController,
  ClearThemeSaveErrorController,
  CloseThemeCreateDialogController,
  CreateThemeController,
  DeleteThemeVersionController,
  GenerateThemeController,
  IncrementThemeVersionController,
  LoadThemePageController,
  OpenEyedropperOverlayController,
  OpenThemeCreateDialogController,
  PersistCurrentThemeController,
  RecenterHueReferenceController,
  SelectThemeAndLoadController,
  SelectThemeByNameController,
  SetApplyPaletteToDarkController,
  SetApplyPaletteToLightController,
  SetAssignColorPreviewController,
  SetColorUseDarkForLightController,
  SetColorVariableDarkController,
  SetColorVariableLightController,
  SetContrastUseDarkForLightController,
  SetContrastVariableDarkMaxController,
  SetContrastVariableDarkMethodController,
  SetContrastVariableDarkMinController,
  SetContrastVariableDarkValueController,
  SetContrastVariableLightMaxController,
  SetContrastVariableLightMethodController,
  SetContrastVariableLightMinController,
  SetContrastVariableLightValueController,
  SetPaletteClusterCountKController,
  SetPaletteClusterCountKPreviewController,
  SetThemeCreateFormNameController,
  SetThemeHueAdjustmentController,
  SetThemeHueReferenceHexController,
  SetThemePreviewTokenRefController,
  SetThemeTemplateController,
  SetThemeVariablesSearchTextController,
  SetVariablesSelectAllController,
  SetVariablesSelectByGroupController,
  SetVariablesSelectByTypeController,
  ToggleVariableSelectionController,
} from '../../../domain/controllers/theme-controller';
import type { AppAction } from '../../core/actions/app-action';
import { ThemeActions, ThemeActionType } from './theme-action-type';

const themeTypes = new Set<string>(Object.values(ThemeActionType));
export const isThemeAction = (a: AppAction): a is ThemeActions => themeTypes.has(a.type);

@injectable()
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
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentController,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexController,
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
        await this.generateTheme.run(
          action.themeName,
          action.themeVersion,
          action.templateName,
          action.templateVersion,
        );
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
      case ThemeActionType.ThemePaletteHueReferenceColorTextOnChange:
        this.setThemeHueReferenceHex.run(action.value);
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
