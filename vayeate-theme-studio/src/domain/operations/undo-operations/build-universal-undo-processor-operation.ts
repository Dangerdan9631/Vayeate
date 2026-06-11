import { singleton } from 'tsyringe';
import { createUndoProcessor } from '../../core/undo-processor';
import type { UndoProcessor } from '../../core/undo-stack-types';
import { CommitAssignColorTextOperation } from '../theme-operations/palette-color-assign/commit-assign-color-text-operation';
import { SetThemeHueAdjustmentOperation } from '../theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import { SetThemePaneSelectionsOperation } from '../theme-operations/pickers/set-theme-pane-selections-operation';
import { SetColorVariableDarkOperation } from '../theme-operations/theme-details/set-color-variable-dark-operation';
import { SetColorVariableLightOperation } from '../theme-operations/theme-details/set-color-variable-light-operation';
import { SetThemeLoadedTemplateOperation } from '../theme-operations/theme-details/set-theme-loaded-template-operation';
import { ApplyCatalogLifecycleUndoOperation } from './apply-catalog-lifecycle-undo-operation';
import { ApplyCatalogUndoStateOperation } from './apply-catalog-undo-state-operation';
import { ApplyTemplateLifecycleUndoOperation } from './apply-template-lifecycle-undo-operation';
import { ApplyTemplateUndoStateOperation } from './apply-template-undo-state-operation';
import { ApplyThemeLifecycleUndoOperation } from './apply-theme-lifecycle-undo-operation';
import { ApplyThemeUndoStateOperation } from './apply-theme-undo-state-operation';
import { buildCatalogUndoHandlers } from './catalog-undo-handlers';
import { buildTemplateUndoHandlers } from './template-undo-handlers';
import { buildThemeUndoHandlers } from './theme-undo-handlers';

/**
 * Builds an undo processor with every catalog, template, and theme handler registered.
 */
@singleton()
export class BuildUniversalUndoProcessorOperation {
  constructor(
    private readonly applyCatalogUndoState: ApplyCatalogUndoStateOperation,
    private readonly applyCatalogLifecycleUndo: ApplyCatalogLifecycleUndoOperation,
    private readonly applyTemplateLifecycleUndo: ApplyTemplateLifecycleUndoOperation,
    private readonly applyTemplateUndoState: ApplyTemplateUndoStateOperation,
    private readonly applyThemeLifecycleUndo: ApplyThemeLifecycleUndoOperation,
    private readonly applyThemeUndoState: ApplyThemeUndoStateOperation,
    private readonly commitAssignColorText: CommitAssignColorTextOperation,
    private readonly setColorVariableLight: SetColorVariableLightOperation,
    private readonly setColorVariableDark: SetColorVariableDarkOperation,
    private readonly setHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly setHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setLoadedTemplate: SetThemeLoadedTemplateOperation,
  ) {}

  /**
   * Runs the build universal undo processor mutation.
   * @returns UndoProcessor result.
   */

  execute(): UndoProcessor {
    return createUndoProcessor([
      ...buildCatalogUndoHandlers({
        applyCatalogUndoState: this.applyCatalogUndoState,
        applyCatalogLifecycleUndo: this.applyCatalogLifecycleUndo,
      }),
      ...buildTemplateUndoHandlers({
        applyTemplateUndoState: this.applyTemplateUndoState,
        applyTemplateLifecycleUndo: this.applyTemplateLifecycleUndo,
      }),
      ...buildThemeUndoHandlers({
        applyThemeUndoState: this.applyThemeUndoState,
        applyThemeLifecycleUndo: this.applyThemeLifecycleUndo,
        commitAssignColorText: this.commitAssignColorText,
        setColorVariableLight: this.setColorVariableLight,
        setColorVariableDark: this.setColorVariableDark,
        setHueAdjustment: this.setHueAdjustment,
        setHueReferenceHex: this.setHueReferenceHex,
        setThemePaneSelections: this.setThemePaneSelections,
        setLoadedTemplate: this.setLoadedTemplate,
      }),
    ]);
  }
}
