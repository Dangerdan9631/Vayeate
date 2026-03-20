import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../utils/version';
import { themeStackId } from '../../../utils/stack-id';
import {
  DeleteTheme,
  LoadThemeRefs,
  GetThemeRefs,
  SetSelectedThemeRef,
  LoadTheme,
  SetThemePaneSelections,
  SetTheme,
} from '../../../operations/theme-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';

@singleton()
export class DeleteThemeVersionController {
  constructor(
    private readonly deleteTheme: DeleteTheme,
    private readonly loadThemeRefs: LoadThemeRefs,
    private readonly getThemeRefs: GetThemeRefs,
    private readonly setSelectedThemeRef: SetSelectedThemeRef,
    private readonly loadTheme: LoadTheme,
    private readonly setThemePaneSelections: SetThemePaneSelections,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
    private readonly setTheme: SetTheme,
  ) {}

  async run(name: string, version: string): Promise<void> {
    await this.deleteTheme.execute(name, version);
    await this.loadThemeRefs.execute();
    const refs = this.getThemeRefs.execute();
    const nextTh = findNearestVersionRef(refs, name, version);

    if (nextTh) {
      this.setSelectedThemeRef.execute(nextTh);
      const loadedNextTh = await this.loadTheme.execute(nextTh.name, nextTh.version);
      if (loadedNextTh) {
        this.setThemePaneSelections.execute(
          loadedNextTh.colorAssignments.map((a) => a.colorRef),
          loadedNextTh.contrastAssignments.map((a) => a.contrastVariableRef),
        );
      }
      this.setCurrentUndoStackId.execute(themeStackId(nextTh.name, nextTh.version));
    } else {
      this.setSelectedThemeRef.execute(null);
      this.setTheme.execute(null);
      this.setThemePaneSelections.execute([], []);
      this.setCurrentUndoStackId.execute(null);
    }
  }
}

