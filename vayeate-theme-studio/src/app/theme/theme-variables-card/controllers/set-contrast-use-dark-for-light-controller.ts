import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schema/primitives';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET } from '../../../../model/undo-action-types';

@singleton()
export class SetContrastUseDarkForLightController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(ref: ContrastVariableKey | undefined, checked: boolean | undefined): Promise<void> {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || ref == null) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    const before = theme;
    const useDark = checked === true;
    const newAssignments = theme.contrastAssignments.map((a) =>
      a.contrastVariableRef === ref ? { ...a, useDarkForLight: useDark } : a,
    );
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);

    await this.recordThemeUndo.execute({
      description: 'Toggle contrast use dark for light',
      actionType: THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET,
      target: `${theme.name}@${theme.version}:${ref}:use-dark-for-light`,
      before,
      after: next,
    });
  }
}
