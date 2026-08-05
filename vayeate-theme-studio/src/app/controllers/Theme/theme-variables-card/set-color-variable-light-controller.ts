import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/Common/schema/primitives';
import { SetColorVariableLightOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/set-color-variable-light-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/Theme/theme-undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';
import { THEME_COLOR_VARIABLE_LIGHT_SET } from '../../../../model/Undo/undo-action-types';

/**
 * Orchestrates set color variable light work for the theme UI.
 */
@singleton()
export class SetColorVariableLightController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setColorVariableLight: SetColorVariableLightOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param ref Input for this call.
 * @param value Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
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
