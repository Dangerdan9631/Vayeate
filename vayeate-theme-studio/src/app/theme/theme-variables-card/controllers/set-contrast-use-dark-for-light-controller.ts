import { singleton } from 'tsyringe';

import type { ContrastVariableKey } from '../../../../model/schema/primitives';

import { SetContrastUseDarkForLightOperation } from '../../../../domain/operations/theme-operations/theme-details/set-contrast-use-dark-for-light-operation';

import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';

import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';

import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

import { deriveUndoContext } from '../../../../model/undo-history';

import { THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET } from '../../../../model/undo-action-types';



/**

 * Orchestrates set contrast use dark for light work for the theme UI.

 */

@singleton()

export class SetContrastUseDarkForLightController {

  constructor(

    private readonly themeUiStore: ThemeUiStore,

    private readonly setContrastUseDarkForLight: SetContrastUseDarkForLightOperation,

    private readonly recordThemeUndo: RecordThemeUndoOperation,

    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,

  ) {}



  /**

 * Validates input and invokes the domain operations for this interaction.

 * @param ref Input for this call.

 * @param checked Input for this call.

 * @returns Promise resolved when orchestration completes.

   */

  async run(ref: ContrastVariableKey | undefined, checked: boolean | undefined): Promise<void> {

    const theme = this.themeUiStore.getStore().state.theme;

    if (!theme || ref == null) return;



    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({

      tabId: 'themes',

      templateRef: theme.templateRef,

      themeRef: { name: theme.name, version: theme.version },

    }));



    const edit = this.setContrastUseDarkForLight.execute(ref, checked === true);

    if (!edit?.changed) return;



    await this.recordThemeUndo.execute({

      description: 'Toggle contrast use dark for light',

      actionType: THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET,

      target: ref,

      before: edit.before,

      after: edit.after,

    });

  }

}

