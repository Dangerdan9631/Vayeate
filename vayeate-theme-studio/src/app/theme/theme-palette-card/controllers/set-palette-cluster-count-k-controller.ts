import { singleton } from 'tsyringe';

import { SetThemePaletteClusterCountOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-palette-cluster-count-operation';

import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';

import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';

import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

import { deriveUndoContext } from '../../../../model/undo-history';

import { THEME_PALETTE_CLUSTER_COUNT_SET } from '../../../../model/undo-action-types';



/**

 * Orchestrates set palette cluster count k work for the theme UI.

 */

@singleton()

export class SetPaletteClusterCountKController {

  constructor(

    private readonly themeUiStore: ThemeUiStore,

    private readonly setPaletteClusterCount: SetThemePaletteClusterCountOperation,

    private readonly recordThemeUndo: RecordThemeUndoOperation,

    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,

  ) {}



  /**

 * Validates input and invokes the domain operations for this interaction.

 * @param value Input for this call.

 * @returns Promise resolved when orchestration completes.

   */

  async run(value: number): Promise<void> {

    const theme = this.themeUiStore.getStore().state.theme;

    if (!theme) return;



    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({

      tabId: 'themes',

      templateRef: theme.templateRef,

      themeRef: { name: theme.name, version: theme.version },

    }));



    const edit = this.setPaletteClusterCount.execute(value);

    if (!edit?.changed) return;



    await this.recordThemeUndo.execute({

      description: 'Set palette cluster count',

      actionType: THEME_PALETTE_CLUSTER_COUNT_SET,

      target: `${theme.name}@${theme.version}:palette-cluster-count`,

      before: edit.before,

      after: edit.after,

    });

  }

}

