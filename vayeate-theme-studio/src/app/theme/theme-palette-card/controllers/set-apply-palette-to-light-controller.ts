import { singleton } from 'tsyringe';

import { SetThemeApplyPaletteToLightOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-apply-palette-to-light-operation';

import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';

import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';

import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

import { deriveUndoContext } from '../../../../model/undo-history';

import { THEME_PALETTE_APPLY_TO_LIGHT_SET } from '../../../../model/undo-action-types';



/**

 * Orchestrates set apply palette to light work for the theme UI.

 */

@singleton()

export class SetApplyPaletteToLightController {

  constructor(

    private readonly themeUiStore: ThemeUiStore,

    private readonly setApplyPaletteToLight: SetThemeApplyPaletteToLightOperation,

    private readonly recordThemeUndo: RecordThemeUndoOperation,

    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,

  ) {}



  /**

 * Validates input and invokes the domain operations for this interaction.

 * @param checked Input for this call.

 * @returns Promise resolved when orchestration completes.

   */

  async run(checked: boolean): Promise<void> {

    const theme = this.themeUiStore.getStore().state.theme;

    if (!theme) return;



    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({

      tabId: 'themes',

      templateRef: theme.templateRef,

      themeRef: { name: theme.name, version: theme.version },

    }));



    const edit = this.setApplyPaletteToLight.execute(checked);

    if (!edit?.changed) return;



    await this.recordThemeUndo.execute({

      description: 'Toggle apply palette to light',

      actionType: THEME_PALETTE_APPLY_TO_LIGHT_SET,

      target: `${theme.name}@${theme.version}:apply-palette-to-light`,

      before: edit.before,

      after: edit.after,

    });

  }

}

