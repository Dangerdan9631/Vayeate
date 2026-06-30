import { singleton } from 'tsyringe';
import { SetStyleVariableFieldOperation } from '../../../../domain/operations/theme-operations/theme-details/set-style-variable-field-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import type { StyleAssignmentField } from '../../../../domain/utils/style-assignment-utils';
import { THEME_STYLE_VARIABLE_FIELD_SET } from '../../../../model/undo-action-types';
import { deriveUndoContext } from '../../../../model/undo-history';

/**
 * Orchestrates set style variable flag work for the theme UI.
 */
@singleton()
export class SetStyleVariableFieldController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setStyleVariableField: SetStyleVariableFieldOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(
    ref: string | undefined,
    side: 'light' | 'dark',
    field: StyleAssignmentField,
    checked: boolean,
  ): Promise<void> {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || ref == null) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    const edit = this.setStyleVariableField.execute(ref, side, field, checked);
    if (!edit?.changed) return;

    await this.recordThemeUndo.execute({
      description: `Set style ${side} ${field}`,
      actionType: THEME_STYLE_VARIABLE_FIELD_SET,
      target: `${ref}:${side}:${field}`,
      before: edit.before,
      after: edit.after,
    });
  }
}
