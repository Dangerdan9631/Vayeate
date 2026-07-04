import { singleton } from 'tsyringe';

import type { ContrastVariableKey } from '../../../../model/Common/schema/primitives';

import { SetContrastVariableFieldOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/set-contrast-variable-field-operation';

import { RecordThemeUndoOperation } from '../../../../domain/operations/Theme/theme-undo-operations/record-theme-undo-operation';

import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';

import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';

import { parseContrastValue } from '../../../../domain/operations/Theme/theme-operations/theme-utils/contrast-utils-operation';

import { deriveUndoContext } from '../../../../model/Undo/undo-history';

import { THEME_CONTRAST_VARIABLE_LIGHT_MAX_SET } from '../../../../model/Undo/undo-action-types';



/**

 * Orchestrates set contrast variable light max work for the theme UI.

 */

@singleton()

export class SetContrastVariableLightMaxController {

  constructor(

    private readonly themeUiStore: ThemeUiStore,

    private readonly setContrastVariableField: SetContrastVariableFieldOperation,

    private readonly recordThemeUndo: RecordThemeUndoOperation,

    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,

  ) {}



  /**

 * Validates input and invokes the domain operations for this interaction.

 * @param ref Input for this call.

 * @param value Input for this call.

 * @returns Promise resolved when orchestration completes.

   */

  async run(ref: ContrastVariableKey | undefined, value: string): Promise<void> {

    const theme = this.themeUiStore.getStore().state.theme;

    if (!theme || ref == null) return;



    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({

      tabId: 'themes',

      templateRef: theme.templateRef,

      themeRef: { name: theme.name, version: theme.version },

    }));



    const num = value === '' || value == null ? null : parseContrastValue(value);

    const edit = this.setContrastVariableField.execute(ref, 'light', 'max', num);

    if (!edit?.changed) return;



    await this.recordThemeUndo.execute({

      description: 'Set contrast light max',

      actionType: THEME_CONTRAST_VARIABLE_LIGHT_MAX_SET,

      target: ref,

      before: edit.before,

      after: edit.after,

    });

  }

}

