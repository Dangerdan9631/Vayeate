import { singleton } from 'tsyringe';

import type { ContrastValue } from '../../../../model/Common/schema/primitives';

import type { ContrastVariableKey } from '../../../../model/Common/schema/primitives';

import { SetContrastVariableFieldOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/set-contrast-variable-field-operation';

import { RecordThemeUndoOperation } from '../../../../domain/operations/Common/undo-operations/record-theme-undo-operation';

import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Common/undo-operations/set-current-undo-stack-id-operation';

import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';

import { parseContrastValue } from '../../../../domain/utils/Theme/contrast-utils';

import { deriveUndoContext } from '../../../../model/Common/undo-history';

import { THEME_CONTRAST_VARIABLE_DARK_VALUE_SET } from '../../../../model/Common/undo-action-types';



/**

 * Orchestrates set contrast variable dark value work for the theme UI.

 */

@singleton()

export class SetContrastVariableDarkValueController {

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

  async run(ref: ContrastVariableKey | undefined, value: ContrastValue): Promise<void> {

    const theme = this.themeUiStore.getStore().state.theme;

    if (!theme || ref == null) return;

    const num = typeof value === 'number' ? value : parseContrastValue(String(value));

    if (num == null) return;



    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({

      tabId: 'themes',

      templateRef: theme.templateRef,

      themeRef: { name: theme.name, version: theme.version },

    }));



    const edit = this.setContrastVariableField.execute(ref, 'dark', 'value', num);

    if (!edit?.changed) return;



    await this.recordThemeUndo.execute({

      description: 'Set contrast dark value',

      actionType: THEME_CONTRAST_VARIABLE_DARK_VALUE_SET,

      target: ref,

      before: edit.before,

      after: edit.after,

    });

  }

}

