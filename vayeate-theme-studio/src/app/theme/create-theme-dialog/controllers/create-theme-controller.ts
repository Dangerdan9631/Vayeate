import { singleton } from 'tsyringe';
import { CreateThemeOperation } from '../../../../domain/operations/theme-operations/theme-list/create-theme-operation';
import { LoadThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetThemeCreateFormNameOperation } from '../../../../domain/operations/theme-operations/theme-list/set-theme-create-form-name-operation';
import { SetThemeCreateDialogOpenOperation } from '../../../../domain/operations/theme-operations/theme-list/set-theme-create-dialog-open-operation';
import { SetThemeIsCreatingOperation } from '../../../../domain/operations/theme-operations/theme-list/set-theme-is-creating-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_CREATED } from '../../../../model/undo-action-types';

@singleton()
export class CreateThemeController {
  constructor(
    private readonly createTheme: CreateThemeOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly setTheme: SetThemeOperation,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation,
    private readonly setThemeCreateDialogOpen: SetThemeCreateDialogOpenOperation,
    private readonly setThemeIsCreating: SetThemeIsCreatingOperation,
    private readonly themeUiStore: ThemeUiStore,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(params: { name: string }): Promise<void> {
    const priorSelectedRef = this.themeUiStore.getStore().state.selectedRef;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: this.themeUiStore.getStore().state.theme?.templateRef,
      themeRef: priorSelectedRef,
    }));

    this.setThemeIsCreating.execute(true);
    this.setThemeCreateDialogOpen.execute(false);
    this.setThemeCreateFormName.execute('');
    try {
      const newTheme = await this.createTheme.execute(params);
      this.loadThemeRefs.execute();
      this.setTheme.execute(newTheme);
      const ref = { name: newTheme.name, version: newTheme.version };
      this.setSelectedThemeRef.execute(ref);
      this.setThemePaneSelections.execute(
        newTheme.colorAssignments.map((a) => a.colorRef),
        newTheme.contrastAssignments.map((a) => a.contrastVariableRef),
      );

      await this.recordThemeUndo.execute({
        description: `Create theme ${params.name}`,
        actionType: THEME_CREATED,
        target: `${params.name}@${newTheme.version}`,
        before: { theme: null, selectedRef: priorSelectedRef },
        after: { theme: newTheme, selectedRef: ref },
      });
    } finally {
      this.setThemeIsCreating.execute(false);
    }
  }
}
