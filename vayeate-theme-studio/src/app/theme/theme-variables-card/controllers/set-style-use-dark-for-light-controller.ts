import { singleton } from 'tsyringe';
import { SetStyleUseDarkForLightOperation } from '../../../../domain/operations/theme-operations/theme-details/set-style-use-dark-for-light-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { THEME_STYLE_USE_DARK_FOR_LIGHT_SET } from '../../../../model/undo-action-types';
import { deriveUndoContext } from '../../../../model/undo-history';

/**
 * Orchestrates style use-dark-for-light updates.
 */
@singleton()
export class SetStyleUseDarkForLightController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setStyleUseDarkForLight: SetStyleUseDarkForLightOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(ref: string | undefined, checked: boolean): Promise<void> {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || ref == null) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    const edit = this.setStyleUseDarkForLight.execute(ref, checked);
    if (!edit?.changed) return;

    await this.recordThemeUndo.execute({
      description: 'Set style use dark for light',
      actionType: THEME_STYLE_USE_DARK_FOR_LIGHT_SET,
      target: ref,
      before: edit.before,
      after: edit.after,
    });
  }
}
