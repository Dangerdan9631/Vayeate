import { singleton } from 'tsyringe';
import { OpenEyedropperOverlayController } from '../../../common/eyedropper-overlay/controllers/open-eyedropper-overlay-controller';
import { AssignColorFromPickerController } from '../controllers/assign-color-from-picker-controller';
import { SetAssignColorPreviewController } from '../controllers/set-assign-color-preview-controller';
import { CommitHueReferenceColorController } from '../controllers/commit-hue-reference-color-controller';
import { RecenterHueReferenceController } from '../controllers/recenter-hue-reference-controller';
import { SetThemeHueAdjustmentController } from '../controllers/set-theme-hue-adjustment-controller';
import { SetApplyPaletteToDarkController } from '../controllers/set-apply-palette-to-dark-controller';
import { SetApplyPaletteToLightController } from '../controllers/set-apply-palette-to-light-controller';
import { ComputePaletteClustersController } from '../controllers/compute-palette-clusters-controller';
import { SetPaletteClusterByDarkController } from '../controllers/set-palette-cluster-by-dark-controller';
import { SetPaletteClusterCountKController } from '../controllers/set-palette-cluster-count-k-controller';
import { SetPaletteClusterCountKPreviewController } from '../controllers/set-palette-cluster-count-k-preview-controller';
import { SetColorRefsSelectionBatchController } from '../controllers/set-color-refs-selection-batch-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { ThemePaletteCardActions, ThemePaletteCardActionType } from './theme-palette-card-action-type';
import { CommitHueReferenceEyeDropperColorController } from '../controllers/commit-hue-reference-eye-dropper-color-controller';
import { CommitAssignColorEyeDropperController } from '../controllers/commit-assign-color-eye-dropper-controller';
import { EyedropperCommitTargetType } from '../../../../model/eyedropper';

/**
 * Routes Theme Palette Card actions to their controllers.
 */
@singleton()
export class ThemePaletteCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly assignColorFromPicker: AssignColorFromPickerController,
    private readonly openEyedropperOverlay: OpenEyedropperOverlayController,
    private readonly commitHueReferenceEyeDropperColor: CommitHueReferenceEyeDropperColorController,
    private readonly commitAssignColorEyeDropper: CommitAssignColorEyeDropperController,
    private readonly recenterHueReference: RecenterHueReferenceController,
    private readonly setApplyPaletteToDark: SetApplyPaletteToDarkController,
    private readonly setApplyPaletteToLight: SetApplyPaletteToLightController,
    private readonly setAssignColorPreview: SetAssignColorPreviewController,
    private readonly setPaletteClusterCountK: SetPaletteClusterCountKController,
    private readonly setPaletteClusterCountKPreview: SetPaletteClusterCountKPreviewController,
    private readonly setPaletteClusterByDark: SetPaletteClusterByDarkController,
    private readonly computePaletteClusters: ComputePaletteClustersController,
    private readonly commitHueReferenceColor: CommitHueReferenceColorController,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentController,
    private readonly setColorRefsSelectionBatch: SetColorRefsSelectionBatchController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(ThemePaletteCardHandler.name);
  }

  /**
 * Dispatches the action to the matching controller.
 * @param action Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async handle(action: ThemePaletteCardActions): Promise<void> {
    switch (action.type) {
      case ThemePaletteCardActionType.ApplyToDarkCheckboxOnToggle:
        return this.setApplyPaletteToDark.run(action.checked);
      case ThemePaletteCardActionType.ApplyToLightCheckboxOnToggle:
        return this.setApplyPaletteToLight.run(action.checked);
      case ThemePaletteCardActionType.AssignColorEyedropperButtonOnClick:
        return this.openEyedropperOverlay.run({ type: EyedropperCommitTargetType.ThemePaletteAssignColor });
      case ThemePaletteCardActionType.AssignColorEyeDropperOnCommit:
        return this.commitAssignColorEyeDropper.run(action.value);
      case ThemePaletteCardActionType.AssignColorPickerOnSelect:
        return this.setAssignColorPreview.run(action.value);
      case ThemePaletteCardActionType.AssignColorPickerOnCommit:
        return this.assignColorFromPicker.run(action.value);
      case ThemePaletteCardActionType.AssignColorPickerOnClose:
        return this.assignColorFromPicker.run(action.value, undefined, action.snapshot);
      case ThemePaletteCardActionType.HueReferenceRecenterButtonOnClick:
        return this.recenterHueReference.run();
      case ThemePaletteCardActionType.HueReferenceCommit:
        return this.commitHueReferenceColor.run(action.value);
      case ThemePaletteCardActionType.HueReferenceColorEyedropperButtonOnClick:
        return this.openEyedropperOverlay.run({ type: EyedropperCommitTargetType.ThemePaletteHueReference });
      case ThemePaletteCardActionType.HueReferenceEyeDropperOnCommit:
        return this.commitHueReferenceEyeDropperColor.run(action.value);
      case ThemePaletteCardActionType.HueSliderOnDelta:
        return this.setThemeHueAdjustment.run(action.value, { deferPreview: true });
      case ThemePaletteCardActionType.HueSliderOnCommit:
        await this.setThemeHueAdjustment.run(action.value, { deferPreview: false });
        return this.computePaletteClusters.run();
      case ThemePaletteCardActionType.ClusterCountSliderOnDelta:
        await this.setPaletteClusterCountKPreview.run(action.value);
        return this.computePaletteClusters.run();
      case ThemePaletteCardActionType.ClusterCountSliderOnCommit:
        await this.setPaletteClusterCountK.run(action.value);
        return this.computePaletteClusters.run();
      case ThemePaletteCardActionType.ClusterVariantCheckboxOnToggle:
        this.setPaletteClusterByDark.run(action.checked);
        return this.computePaletteClusters.run();
      case ThemePaletteCardActionType.RecomputeClusters:
        return this.computePaletteClusters.run();
      case ThemePaletteCardActionType.ColorRefsSelectionCommit:
        return this.setColorRefsSelectionBatch.run(action.refs, action.checked);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemePaletteCardAction union not exhaustive)', { action: _exhaustive });
  }
}
