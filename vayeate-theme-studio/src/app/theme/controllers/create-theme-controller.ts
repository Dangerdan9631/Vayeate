import { singleton } from 'tsyringe';
import { CreateThemeOperation } from '../../../domain/operations/theme-operations/theme-list/create-theme-operation';
import { LoadThemeRefsOperation } from '../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import { SetThemeOperation } from '../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { SetSelectedThemeRefOperation } from '../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemePaneSelectionsOperation } from '../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetThemeCreateFormNameOperation } from '../../../domain/operations/theme-operations/theme-list/set-theme-create-form-name-operation';
import { SetCurrentUndoStackIdOperation } from '../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { SetThemeCreateDialogOpenOperation } from '../../../domain/operations/theme-operations/theme-list/set-theme-create-dialog-open-operation';
import { SetThemeIsCreatingOperation } from '../../../domain/operations/theme-operations/theme-list/set-theme-is-creating-operation';
import { themeStackId } from '../../../domain/utils/theme-stack-id';

@singleton()
export class CreateThemeController {
  constructor(
    private readonly createTheme: CreateThemeOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly setTheme: SetThemeOperation,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation,
    private readonly setThemeCreateDialogOpen: SetThemeCreateDialogOpenOperation,
    private readonly setThemeIsCreating: SetThemeIsCreatingOperation,
  ) {}

  async run(params: { name: string }): Promise<void> {
    this.setThemeIsCreating.execute(true);
    this.setThemeCreateDialogOpen.execute(false);
    this.setThemeCreateFormName.execute('');
    try {
      const newTheme = await this.createTheme.execute(params);
      this.loadThemeRefs.execute();
      this.setTheme.execute(newTheme);
      this.setSelectedThemeRef.execute({ name: newTheme.name, version: newTheme.version });
      this.setThemePaneSelections.execute(
        newTheme.colorAssignments.map((a) => a.colorRef),
        newTheme.contrastAssignments.map((a) => a.contrastVariableRef),
      );
      this.setCurrentUndoStackId.execute(themeStackId(newTheme.name, newTheme.version));
    } finally {
      this.setThemeIsCreating.execute(false);
    }
  }
}
