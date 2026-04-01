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
import { AppStateSetter } from '../../../state/app-state-setter';
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
    private readonly appStateSetter: AppStateSetter,
  ) {}

  async run(params: { name: string }): Promise<void> {
    this.appStateSetter.apply({ type: 'SET_THEME_IS_CREATING', value: true });
    this.appStateSetter.apply({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
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
      this.appStateSetter.apply({ type: 'SET_THEME_IS_CREATING', value: false });
    }
  }
}

