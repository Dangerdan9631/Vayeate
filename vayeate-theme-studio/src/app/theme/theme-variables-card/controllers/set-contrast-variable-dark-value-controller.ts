import { singleton } from 'tsyringe';
import type { ContrastValue } from '../../../../model/schema/primitives';
import type { ContrastVariableKey } from '../../../../model/schema/primitives';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { parseContrastValue, updateContrastAssignment } from '../../../../domain/utils/contrast-utils';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_CONTRAST_VARIABLE_DARK_VALUE_SET } from '../../../../model/undo-action-types';

@singleton()
export class SetContrastVariableDarkValueController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

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

    const before = theme;
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
      value: num,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);

    await this.recordThemeUndo.execute({
      description: 'Set contrast dark value',
      actionType: THEME_CONTRAST_VARIABLE_DARK_VALUE_SET,
      target: `${theme.name}@${theme.version}:${ref}:dark:value`,
      before,
      after: next,
    });
  }
}
