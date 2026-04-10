import { singleton } from 'tsyringe';
import {
  CreateThemeOperation,
  LoadThemeRefsOperation,
  SetThemeOperation,
  SetSelectedThemeRefOperation,
  SetThemePaneSelectionsOperation,
  SetThemeCreateFormNameOperation,
} from '../../../operations/theme-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { SetThemeCreateDialogOpenOperation } from '../../../operations/theme-operations/theme-list/set-theme-create-dialog-open-operation';
import { SetThemeIsCreatingOperation } from '../../../operations/theme-operations/theme-list/set-theme-is-creating-operation';
import { themeStackId } from '../../../utils/stack-id';

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
      await this.loadThemeRefs.execute();
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
