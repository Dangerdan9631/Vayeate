import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { SetColorVariableLightOperation } from '../../../../domain/operations/theme-operations/theme-details/set-color-variable-light-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_COLOR_VARIABLE_LIGHT_SET } from '../../../../model/undo-action-types';

@singleton()
export class SetColorVariableLightController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setColorVariableLight: SetColorVariableLightOperation,
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

    const edit = this.setColorVariableLight.execute(ref, value);
    if (!edit?.changed) return;

    await this.recordThemeUndo.execute({
      description: `Change ${ref} light color`,
      actionType: THEME_COLOR_VARIABLE_LIGHT_SET,
      target: ref,
      before: edit.before,
      after: edit.after,
    });
  }
}
