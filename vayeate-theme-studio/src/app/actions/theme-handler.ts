import { injectable } from 'tsyringe';
import {
  ApplyAssignColorDraftController,
  AssignColorFromPickerController,
  ClearPreviewVariableFilterController,
  ClearThemeSaveErrorController,
  CloseEyedropperOverlayController,
  CloseThemeCreateDialogController,
  CommitAssignColorTextController,
  CommitEyedropperColorController,
  CommitHueReferenceColorController,
  CreateThemeController,
  DeleteThemeVersionController,
  GenerateThemeController,
  HandleMemberSwatchRightClickController,
  IncrementThemeVersionController,
  LoadThemePageController,
  OpenEyedropperOverlayController,
  OpenThemeCreateDialogController,
  PersistCurrentThemeController,
  PreviewSampleButtonScrollController,
  RecenterHueReferenceController,
  SelectThemeAndLoadController,
  SelectThemeByNameController,
  SetApplyPaletteToDarkController,
  SetApplyPaletteToLightController,
  SetAssignColorDraftTextController,
  SetAssignColorPreviewController,
  SetColorUseDarkForLightController,
  SetColorVariableDarkController,
  SetColorVariableFromHexController,
  SetColorVariableFromHexPreviewController,
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
  SetPaletteClusterGroupToggledController,
  SetPaletteFullSelectionController,
  SetPaletteMemberSwatchController,
  SetPalettePrimarySwatchController,
  SetPaletteSwatchGroupSelectionController,
  SetPreviewSelectedSampleController,
  SetPreviewVariableFilterTextController,
  SetPreviewVariableSelectionController,
  SetThemeCreateFormNameController,
  SetThemeHueAdjustmentController,
  SetThemeHueReferenceHexController,
  SetThemeOpenPickerContextController,
  SetThemePreviewTokenRefController,
  SetThemeTemplateController,
  SetThemeTemplateToggleController,
  SetThemeTemplateVersionOnlyController,
  SetThemeVariableDraftTextController,
  SetThemeVariablesSearchTextController,
  SetVariablesSelectAllController,
  SetVariablesSelectByGroupController,
  SetVariablesSelectByTypeController,
  ToggleVariableSelectionController,
} from '../../domain/controllers/theme-controller';
import type { ActionHandler, HandlerDeps, ThemeAction } from './handler-types';
import { ThemeActionType } from './action-types';

@injectable()
export class ThemeActionHandler implements ActionHandler<ThemeAction> {
  constructor(
    private readonly applyAssignColorDraft: ApplyAssignColorDraftController,
    private readonly assignColorFromPicker: AssignColorFromPickerController,
    private readonly clearPreviewVariableFilter: ClearPreviewVariableFilterController,
    private readonly clearThemeSaveError: ClearThemeSaveErrorController,
    private readonly closeEyedropperOverlay: CloseEyedropperOverlayController,
    private readonly closeThemeCreateDialog: CloseThemeCreateDialogController,
    private readonly commitAssignColorText: CommitAssignColorTextController,
    private readonly commitEyedropperColor: CommitEyedropperColorController,
    private readonly commitHueReferenceColor: CommitHueReferenceColorController,
    private readonly createTheme: CreateThemeController,
    private readonly deleteThemeVersion: DeleteThemeVersionController,
    private readonly generateTheme: GenerateThemeController,
    private readonly handleMemberSwatchRightClick: HandleMemberSwatchRightClickController,
    private readonly incrementThemeVersion: IncrementThemeVersionController,
    private readonly loadThemePage: LoadThemePageController,
    private readonly openEyedropperOverlay: OpenEyedropperOverlayController,
    private readonly openThemeCreateDialog: OpenThemeCreateDialogController,
    private readonly persistCurrentTheme: PersistCurrentThemeController,
    private readonly previewSampleButtonScroll: PreviewSampleButtonScrollController,
    private readonly recenterHueReference: RecenterHueReferenceController,
    private readonly selectThemeAndLoad: SelectThemeAndLoadController,
    private readonly selectThemeByName: SelectThemeByNameController,
    private readonly setApplyPaletteToDark: SetApplyPaletteToDarkController,
    private readonly setApplyPaletteToLight: SetApplyPaletteToLightController,
    private readonly setAssignColorDraftText: SetAssignColorDraftTextController,
    private readonly setAssignColorPreview: SetAssignColorPreviewController,
    private readonly setColorUseDarkForLight: SetColorUseDarkForLightController,
    private readonly setColorVariableDark: SetColorVariableDarkController,
    private readonly setColorVariableFromHex: SetColorVariableFromHexController,
    private readonly setColorVariableFromHexPreview: SetColorVariableFromHexPreviewController,
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
    private readonly setPaletteClusterGroupToggled: SetPaletteClusterGroupToggledController,
    private readonly setPaletteFullSelection: SetPaletteFullSelectionController,
    private readonly setPaletteMemberSwatch: SetPaletteMemberSwatchController,
    private readonly setPalettePrimarySwatch: SetPalettePrimarySwatchController,
    private readonly setPaletteSwatchGroupSelection: SetPaletteSwatchGroupSelectionController,
    private readonly setPreviewSelectedSample: SetPreviewSelectedSampleController,
    private readonly setPreviewVariableFilterText: SetPreviewVariableFilterTextController,
    private readonly setPreviewVariableSelection: SetPreviewVariableSelectionController,
    private readonly setThemeCreateFormName: SetThemeCreateFormNameController,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentController,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexController,
    private readonly setThemeOpenPickerContext: SetThemeOpenPickerContextController,
    private readonly setThemePreviewTokenRef: SetThemePreviewTokenRefController,
    private readonly setThemeTemplate: SetThemeTemplateController,
    private readonly setThemeTemplateToggle: SetThemeTemplateToggleController,
    private readonly setThemeTemplateVersionOnly: SetThemeTemplateVersionOnlyController,
    private readonly setThemeVariableDraftText: SetThemeVariableDraftTextController,
    private readonly setThemeVariablesSearchText: SetThemeVariablesSearchTextController,
    private readonly setVariablesSelectAll: SetVariablesSelectAllController,
    private readonly setVariablesSelectByGroup: SetVariablesSelectByGroupController,
    private readonly setVariablesSelectByType: SetVariablesSelectByTypeController,
    private readonly toggleVariableSelection: ToggleVariableSelectionController,
  ) {}

  async handle(action: ThemeAction, deps: HandlerDeps): Promise<void> {
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
      case ThemeActionType.ThemeCreateDialogOnOpen:
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
      case ThemeActionType.ThemeDetailsTemplateListOnCommit:
        await this.setThemeTemplate.run(action.name, action.version);
        break;
      case ThemeActionType.ThemeDetailsTemplateVersionListOnCommit:
        await this.setThemeTemplate.run(action.name, action.version);
        break;
      case ThemeActionType.ThemeDetailsCatalogCheckboxOnToggle:
        this.setThemeTemplateToggle.run(action.checked);
        break;
      case ThemeActionType.ThemeDetailsCatalogVersionListOnCommit:
        await this.setThemeTemplateVersionOnly.run(action.value);
        break;
      case ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit:
        this.setThemePreviewTokenRef.run(action.tokenRefField, action.value);
        break;
      case ThemeActionType.ThemePaletteApplyToDarkCheckboxOnToggle:
        this.setApplyPaletteToDark.run(action.checked);
        break;
      case ThemeActionType.ThemePaletteApplyToLightCheckboxOnToggle:
        this.setApplyPaletteToLight.run(action.checked);
        break;
      case ThemeActionType.ThemePaletteAssignColorTextOnChange:
        this.setAssignColorDraftText.run(action.value);
        break;
      case ThemeActionType.ThemePaletteAssignColorTextOnCommit:
        this.commitAssignColorText.run(action.value);
        break;
      case ThemeActionType.ThemePaletteAssignColorButtonOnClick:
        this.applyAssignColorDraft.run();
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
      case ThemeActionType.ThemePaletteHueReferenceColorTextOnChange:
        this.setThemeHueReferenceHex.run(action.value);
        break;
      case ThemeActionType.ThemePaletteHueReferenceColorTextOnCommit:
        this.commitHueReferenceColor.run(action.value);
        break;
      case ThemeActionType.ThemePaletteHueReferenceColorButtonOnClick:
        this.setThemeOpenPickerContext.run('picker:hue');
        break;
      case ThemeActionType.ThemePaletteHueReferenceColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run('eyedropper:hue');
        break;
      case ThemeActionType.ThemePaletteHueReferenceColorPickerOnSelect:
        this.setThemeHueReferenceHex.run(action.value);
        break;
      case ThemeActionType.ThemePaletteHueReferenceColorPickerOnCommit:
        this.commitHueReferenceColor.run(action.value);
        break;
      case ThemeActionType.ThemePaletteHueReferenceRecenterButtonOnClick:
        this.recenterHueReference.run();
        break;
      case ThemeActionType.ThemePaletteHueSliderOnDelta:
        this.setThemeHueAdjustment.run(action.value);
        break;
      case ThemeActionType.ThemePaletteHueSliderOnCommit:
        this.setThemeHueAdjustment.run(action.value);
        break;
      case ThemeActionType.ThemePaletteClusterCountSliderOnDelta:
        this.setPaletteClusterCountKPreview.run(action.value);
        break;
      case ThemeActionType.ThemePaletteClusterCountSliderOnCommit:
        this.setPaletteClusterCountK.run(action.value);
        break;
      case ThemeActionType.ThemePaletteClusterGroupCheckboxOnToggle:
        this.setPaletteClusterGroupToggled.run(action.groupId, action.checked);
        break;
      case ThemeActionType.ThemePaletteSwatchFullSelectCheckboxOnToggle:
        this.setPaletteFullSelection.run(action.fullColorRefs, action.fullContrastRefs);
        break;
      case ThemeActionType.ThemePaletteSwatchGroupSelectCheckboxOnToggle:
        this.setPaletteSwatchGroupSelection.run(action.refs, action.checked);
        break;
      case ThemeActionType.ThemePalettePrimarySwatchButtonOnClick:
        this.setPalettePrimarySwatch.run(action.ref);
        break;
      case ThemeActionType.ThemePalettePrimarySwatchButtonOnDoubleClick:
        this.setPalettePrimarySwatch.run(action.ref);
        break;
      case ThemeActionType.ThemePalettePrimarySwatchButtonOnRightClick:
        this.setPalettePrimarySwatch.run(action.ref);
        break;
      case ThemeActionType.ThemePaletteMemberSwatchButtonOnClick:
        this.setPaletteMemberSwatch.run(action.ref);
        break;
      case ThemeActionType.ThemePaletteMemberSwatchButtonOnRightClick:
        this.handleMemberSwatchRightClick.run(action.ref);
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
      case ThemeActionType.ThemeVariablesSearchTextOnChange:
        this.setThemeVariablesSearchText.run(action.value);
        break;
      case ThemeActionType.ThemeVariablesVariableSelectionCheckboxOnToggle:
        this.toggleVariableSelection.run(action.checked, action.ref);
        break;
      case ThemeActionType.ThemeVariablesLightUseDarkCheckboxOnToggle:
        this.setContrastUseDarkForLight.run(action.ref, action.checked);
        break;
      case ThemeActionType.ThemeVariablesColorUseDarkForLightCheckboxOnToggle:
        this.setColorUseDarkForLight.run(action.ref, action.checked);
        break;
      case ThemeActionType.ThemeVariablesColorDarkTextOnChange:
        this.setThemeVariableDraftText.run(`colorDark:${action.ref}`, action.value);
        break;
      case ThemeActionType.ThemeVariablesColorDarkTextOnCommit:
        this.setColorVariableDark.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesColorDarkColorButtonOnClick:
        this.setThemeOpenPickerContext.run(`dark:${action.ref}`);
        break;
      case ThemeActionType.ThemeVariablesColorDarkColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run(`eyedropper:dark:${action.ref}`);
        break;
      case ThemeActionType.ThemeVariablesColorDarkColorPickerOnSelect:
        this.setColorVariableFromHexPreview.run(action.ref, action.value, 'dark');
        break;
      case ThemeActionType.ThemeVariablesColorDarkColorPickerOnCommit:
        this.setColorVariableFromHex.run(action.ref, action.value, 'dark');
        break;
      case ThemeActionType.ThemeVariablesColorLightTextOnChange:
        this.setThemeVariableDraftText.run(`colorLight:${action.ref}`, action.value);
        break;
      case ThemeActionType.ThemeVariablesColorLightTextOnCommit:
        this.setColorVariableLight.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesColorLightColorButtonOnClick:
        this.setThemeOpenPickerContext.run(`light:${action.ref}`);
        break;
      case ThemeActionType.ThemeVariablesColorLightColorEyedropperButtonOnClick:
        await this.openEyedropperOverlay.run(`eyedropper:light:${action.ref}`);
        break;
      case ThemeActionType.ThemeVariablesColorLightColorPickerOnSelect:
        this.setColorVariableFromHexPreview.run(action.ref, action.value, 'light');
        break;
      case ThemeActionType.ThemeVariablesColorLightColorPickerOnCommit:
        this.setColorVariableFromHex.run(action.ref, action.value, 'light');
        break;
      case ThemeActionType.ThemeVariablesContrastDarkValueTextOnChange:
        this.setThemeVariableDraftText.run(`contrastDark:value:${action.ref}`, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkValueTextOnCommit:
        this.setContrastVariableDarkValue.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMethodListOnCommit:
        this.setContrastVariableDarkMethod.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMinTextOnChange:
        this.setThemeVariableDraftText.run(`contrastDark:min:${action.ref}`, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMinTextOnCommit:
        this.setContrastVariableDarkMin.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMaxTextOnChange:
        this.setThemeVariableDraftText.run(`contrastDark:max:${action.ref}`, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastDarkMaxTextOnCommit:
        this.setContrastVariableDarkMax.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightValueTextOnChange:
        this.setThemeVariableDraftText.run(`contrastLight:value:${action.ref}`, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightValueTextOnCommit:
        this.setContrastVariableLightValue.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMethodListOnCommit:
        this.setContrastVariableLightMethod.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMinTextOnChange:
        this.setThemeVariableDraftText.run(`contrastLight:min:${action.ref}`, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMinTextOnCommit:
        this.setContrastVariableLightMin.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMaxTextOnChange:
        this.setThemeVariableDraftText.run(`contrastLight:max:${action.ref}`, action.value);
        break;
      case ThemeActionType.ThemeVariablesContrastLightMaxTextOnCommit:
        this.setContrastVariableLightMax.run(action.ref, action.value);
        break;
      case ThemeActionType.ThemePreviewVariableListOnCommit:
        this.setPreviewVariableSelection.run(action.value);
        break;
      case ThemeActionType.ThemePreviewVariableFilterTextOnChange:
        this.setPreviewVariableFilterText.run(action.value);
        break;
      case ThemeActionType.ThemePreviewVariableFilterClearOnClick:
        this.clearPreviewVariableFilter.run();
        break;
      case ThemeActionType.ThemePreviewSampleButtonOnClick:
        this.previewSampleButtonScroll.run();
        break;
      case ThemeActionType.ThemePreviewSampleListOnCommit:
        this.setPreviewSelectedSample.run(action.value);
        break;
      case ThemeActionType.ThemeEyedropperOverlayCancelButtonOnClick:
        this.closeEyedropperOverlay.run();
        break;
      case ThemeActionType.ThemeEyedropperOverlayColorCommitOnClick:
        this.commitEyedropperColor.run(action.hex, deps.getState().ui.eyedropper.contextKey);
        break;
    }
  }
}
