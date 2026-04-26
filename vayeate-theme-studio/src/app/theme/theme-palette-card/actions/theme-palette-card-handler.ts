import { singleton } from 'tsyringe';
import { OpenEyedropperOverlayController } from '../../../common/eyedropper-overlay/controllers/open-eyedropper-overlay-controller';
import { AssignColorFromPickerController } from '../controllers/assign-color-from-picker-controller';
import { SetAssignColorPreviewController } from '../controllers/set-assign-color-preview-controller';
import { CommitHueReferenceColorController } from '../controllers/commit-hue-reference-color-controller';
import { RecenterHueReferenceController } from '../controllers/recenter-hue-reference-controller';
import { SetThemeHueAdjustmentController } from '../controllers/set-theme-hue-adjustment-controller';
import { SetApplyPaletteToDarkController } from '../controllers/set-apply-palette-to-dark-controller';
import { SetApplyPaletteToLightController } from '../controllers/set-apply-palette-to-light-controller';
import { SetPaletteClusterCountKController } from '../controllers/set-palette-cluster-count-k-controller';
import { SetPaletteClusterCountKPreviewController } from '../controllers/set-palette-cluster-count-k-preview-controller';
import { PersistCurrentThemeController } from '../controllers/persist-current-theme-controller';
import { SetColorRefsSelectionBatchController } from '../controllers/set-color-refs-selection-batch-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { ThemePaletteCardActions, ThemePaletteCardActionType } from './theme-palette-card-action-type';
import { CommitHueReferenceEyeDropperColorController } from '../controllers/commit-hue-reference-eye-dropper-color-controller';
import { CommitAssignColorEyeDropperController } from '../controllers/commit-assign-color-eye-dropper-controller';

@singleton()
export class ThemePaletteCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly assignColorFromPicker: AssignColorFromPickerController,
    private readonly openEyedropperOverlay: OpenEyedropperOverlayController,
    private readonly commitHueReferenceEyeDropperColor: CommitHueReferenceEyeDropperColorController,
    private readonly commitAssignColorEyeDropper: CommitAssignColorEyeDropperController,
    private readonly persistCurrentTheme: PersistCurrentThemeController,
    private readonly recenterHueReference: RecenterHueReferenceController,
    private readonly setApplyPaletteToDark: SetApplyPaletteToDarkController,
    private readonly setApplyPaletteToLight: SetApplyPaletteToLightController,
    private readonly setAssignColorPreview: SetAssignColorPreviewController,
    private readonly setPaletteClusterCountK: SetPaletteClusterCountKController,
    private readonly setPaletteClusterCountKPreview: SetPaletteClusterCountKPreviewController,
    private readonly commitHueReferenceColor: CommitHueReferenceColorController,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentController,
    private readonly setColorRefsSelectionBatch: SetColorRefsSelectionBatchController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(ThemePaletteCardHandler.name);
  }

  async handle(action: ThemePaletteCardActions): Promise<void> {
    switch (action.type) {
      case ThemePaletteCardActionType.ApplyToDarkCheckboxOnToggle:
        return this.setApplyPaletteToDark.run(action.checked);
      case ThemePaletteCardActionType.ApplyToLightCheckboxOnToggle:
        return this.setApplyPaletteToLight.run(action.checked);
      case ThemePaletteCardActionType.AssignColorEyedropperButtonOnClick:
        return this.openEyedropperOverlay.run({ type: ThemePaletteCardActionType.AssignColorEyeDropperOnCommit });
      case ThemePaletteCardActionType.AssignColorEyeDropperOnCommit:
        return this.commitAssignColorEyeDropper.run();
      case ThemePaletteCardActionType.AssignColorPickerOnSelect:
        return this.setAssignColorPreview.run(action.value);
      case ThemePaletteCardActionType.AssignColorPickerOnCommit:
        return this.assignColorFromPicker.run(action.value);
      case ThemePaletteCardActionType.AssignColorPickerOnClose:
        return this.persistCurrentTheme.run();
      case ThemePaletteCardActionType.HueReferenceRecenterButtonOnClick:
        return this.recenterHueReference.run();
      case ThemePaletteCardActionType.HueReferenceCommit:
        return this.commitHueReferenceColor.run(action.value);
      case ThemePaletteCardActionType.HueReferenceColorEyedropperButtonOnClick:
        return this.openEyedropperOverlay.run({ type: ThemePaletteCardActionType.HueReferenceEyeDropperOnCommit });
      case ThemePaletteCardActionType.HueReferenceEyeDropperOnCommit:
        return this.commitHueReferenceEyeDropperColor.run();
      case ThemePaletteCardActionType.HueSliderOnDelta:
        return this.setThemeHueAdjustment.run(action.value);
      case ThemePaletteCardActionType.ClusterCountSliderOnDelta:
        return this.setPaletteClusterCountKPreview.run(action.value);
      case ThemePaletteCardActionType.ClusterCountSliderOnCommit:
        return this.setPaletteClusterCountK.run(action.value);
      case ThemePaletteCardActionType.ColorRefsSelectionCommit:
        return this.setColorRefsSelectionBatch.run(action.refs, action.checked);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemePaletteCardAction union not exhaustive)', { action: _exhaustive });
  }
}
