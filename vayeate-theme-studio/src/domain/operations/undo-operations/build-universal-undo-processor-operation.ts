import { singleton } from 'tsyringe';

import { createUndoProcessor } from '../../core/undo-processor';

import type { UndoProcessor } from '../../core/undo-stack-types';

import { SetThemeHueAdjustmentOperation } from '../theme-operations/palette-hue/set-theme-hue-adjustment-operation';

import { SetThemeHueReferenceHexOperation } from '../theme-operations/palette-hue/set-theme-hue-reference-hex-operation';

import { SetThemePaneSelectionsOperation } from '../theme-operations/pickers/set-theme-pane-selections-operation';

import { SetColorUseDarkForLightOperation } from '../theme-operations/theme-details/set-color-use-dark-for-light-operation';

import { SetColorVariableDarkOperation } from '../theme-operations/theme-details/set-color-variable-dark-operation';

import { SetColorVariableLightOperation } from '../theme-operations/theme-details/set-color-variable-light-operation';

import { SetContrastUseDarkForLightOperation } from '../theme-operations/theme-details/set-contrast-use-dark-for-light-operation';

import { SetContrastVariableFieldOperation } from '../theme-operations/theme-details/set-contrast-variable-field-operation';

import { SetThemeApplyPaletteToDarkOperation } from '../theme-operations/theme-details/set-theme-apply-palette-to-dark-operation';

import { SetThemeApplyPaletteToLightOperation } from '../theme-operations/theme-details/set-theme-apply-palette-to-light-operation';

import { SetThemeLoadedTemplateOperation } from '../theme-operations/theme-details/set-theme-loaded-template-operation';

import { SetThemePaletteClusterCountOperation } from '../theme-operations/theme-details/set-theme-palette-cluster-count-operation';

import { SetThemePreviewTokenRefFieldOperation } from '../theme-operations/theme-details/set-theme-preview-token-ref-field-operation';

import { ApplyCatalogLifecycleUndoOperation } from './apply-catalog-lifecycle-undo-operation';

import { ApplyCatalogSourceUrlUndoOperation } from './apply-catalog-source-url-undo-operation';

import { ApplyCatalogUndoStateOperation } from './apply-catalog-undo-state-operation';

import { ApplyTemplateLifecycleUndoOperation } from './apply-template-lifecycle-undo-operation';

import { ApplyTemplateUndoStateOperation } from './apply-template-undo-state-operation';

import { ApplyThemeLifecycleUndoOperation } from './apply-theme-lifecycle-undo-operation';

import { ApplyThemeUndoStateOperation } from './apply-theme-undo-state-operation';

import { buildCatalogUndoHandlers } from './catalog-undo-handlers';

import { buildTemplateUndoHandlers } from './template-undo-handlers';

import { buildThemeUndoHandlers } from './theme-undo-handlers';

import { RestoreThemePaletteAssignUndoOperation } from './restore-theme-palette-assign-undo-operation';



/**

 * Builds an undo processor with every catalog, template, and theme handler registered.

 */

@singleton()

export class BuildUniversalUndoProcessorOperation {

  private cachedProcessor: UndoProcessor | null = null;



  constructor(

    private readonly applyCatalogUndoState: ApplyCatalogUndoStateOperation,

    private readonly applyCatalogLifecycleUndo: ApplyCatalogLifecycleUndoOperation,

    private readonly applyCatalogSourceUrlUndo: ApplyCatalogSourceUrlUndoOperation,

    private readonly applyTemplateLifecycleUndo: ApplyTemplateLifecycleUndoOperation,

    private readonly applyTemplateUndoState: ApplyTemplateUndoStateOperation,

    private readonly applyThemeLifecycleUndo: ApplyThemeLifecycleUndoOperation,

    private readonly applyThemeUndoState: ApplyThemeUndoStateOperation,

    private readonly restorePaletteAssignUndo: RestoreThemePaletteAssignUndoOperation,

    private readonly setColorVariableLight: SetColorVariableLightOperation,

    private readonly setColorVariableDark: SetColorVariableDarkOperation,

    private readonly setContrastVariableField: SetContrastVariableFieldOperation,

    private readonly setContrastUseDarkForLight: SetContrastUseDarkForLightOperation,

    private readonly setColorUseDarkForLight: SetColorUseDarkForLightOperation,

    private readonly setApplyPaletteToLight: SetThemeApplyPaletteToLightOperation,

    private readonly setApplyPaletteToDark: SetThemeApplyPaletteToDarkOperation,

    private readonly setPaletteClusterCount: SetThemePaletteClusterCountOperation,

    private readonly setPreviewTokenRefField: SetThemePreviewTokenRefFieldOperation,

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

    if (this.cachedProcessor) {

      return this.cachedProcessor;

    }



    this.cachedProcessor = createUndoProcessor([

      ...buildCatalogUndoHandlers({

        applyCatalogUndoState: this.applyCatalogUndoState,

        applyCatalogLifecycleUndo: this.applyCatalogLifecycleUndo,

        applyCatalogSourceUrlUndo: this.applyCatalogSourceUrlUndo,

      }),

      ...buildTemplateUndoHandlers({

        applyTemplateUndoState: this.applyTemplateUndoState,

        applyTemplateLifecycleUndo: this.applyTemplateLifecycleUndo,

      }),

      ...buildThemeUndoHandlers({

        applyThemeUndoState: this.applyThemeUndoState,

        applyThemeLifecycleUndo: this.applyThemeLifecycleUndo,

        restorePaletteAssignUndo: this.restorePaletteAssignUndo,

        setColorVariableLight: this.setColorVariableLight,

        setColorVariableDark: this.setColorVariableDark,

        setContrastVariableField: this.setContrastVariableField,

        setContrastUseDarkForLight: this.setContrastUseDarkForLight,

        setColorUseDarkForLight: this.setColorUseDarkForLight,

        setApplyPaletteToLight: this.setApplyPaletteToLight,

        setApplyPaletteToDark: this.setApplyPaletteToDark,

        setPaletteClusterCount: this.setPaletteClusterCount,

        setPreviewTokenRefField: this.setPreviewTokenRefField,

        setHueAdjustment: this.setHueAdjustment,

        setHueReferenceHex: this.setHueReferenceHex,

        setThemePaneSelections: this.setThemePaneSelections,

        setLoadedTemplate: this.setLoadedTemplate,

      }),

    ]);

    return this.cachedProcessor;

  }

}

