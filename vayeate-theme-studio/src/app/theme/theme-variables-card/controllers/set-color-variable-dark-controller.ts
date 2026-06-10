import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { createUndoProcessor } from '../../../../domain/core/undo-processor';
import { SetColorVariableDarkOperation } from '../../../../domain/operations/theme-operations/theme-details/set-color-variable-dark-operation';
import { RecordUndoEntryOperation } from '../../../../domain/operations/undo-operations/record-undo-entry-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

@singleton()
export class SetColorVariableDarkController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setColorVariableDark: SetColorVariableDarkOperation,
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(ref: ColorVariableKey | undefined, value: string): Promise<void> {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || !ref) return;
    const context = deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    });
    this.setCurrentUndoStackId.executeForContext(context);

    const edit = this.setColorVariableDark.execute(ref, value);
    if (!edit) return;

    await this.recordUndoEntry.execute({
      completed: edit.changed,
      description: `Change ${ref} dark color`,
      diffs: [{
        actionType: 'THEME_COLOR_VARIABLE_DARK_SET',
        target: ref,
        before: edit.before,
        after: edit.after,
      }],
      processor: createUndoProcessor([{
        actionType: 'THEME_COLOR_VARIABLE_DARK_SET',
        apply: (action) => {
          this.setColorVariableDark.execute(action.target as ColorVariableKey, String(action.after ?? ''));
        },
        revert: (action) => {
          this.setColorVariableDark.execute(action.target as ColorVariableKey, String(action.before ?? ''));
        },
      }]),
    });
  }
}


