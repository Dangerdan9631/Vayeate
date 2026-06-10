import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { SetColorVariableDarkOperation } from '../../../../domain/operations/theme-operations/theme-details/set-color-variable-dark-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_COLOR_VARIABLE_DARK_SET } from '../../../../model/undo-action-types';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

@singleton()
export class SetColorVariableDarkController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setColorVariableDark: SetColorVariableDarkOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
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
    if (!edit?.changed) return;

    await this.recordThemeUndo.execute({
      description: `Change ${ref} dark color`,
      actionType: THEME_COLOR_VARIABLE_DARK_SET,
      target: ref,
      before: edit.before,
      after: edit.after,
    });
  }
}
