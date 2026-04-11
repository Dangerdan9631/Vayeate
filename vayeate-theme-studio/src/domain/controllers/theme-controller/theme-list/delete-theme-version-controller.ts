import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../utils/find-nearest-version-ref';
import { themeStackId } from '../../../utils/theme-stack-id';
import { DeleteThemeOperation } from '../../../operations/theme-operations/theme-list/delete-theme-operation';
import { LoadThemeRefsOperation } from '../../../operations/theme-operations/theme-list/load-theme-refs-operation';
import { GetThemeRefsOperation } from '../../../operations/theme-operations/theme-list/get-theme-refs-operation';
import { SetSelectedThemeRefOperation } from '../../../operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { LoadThemeOperation } from '../../../operations/theme-operations/theme-details/load-theme-operation';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetThemeOperation } from '../../../operations/theme-operations/theme-details/set-theme-operation';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations/set-current-undo-stack-id-operation';

@singleton()
export class DeleteThemeVersionController {
  constructor(
    private readonly deleteTheme: DeleteThemeOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly getThemeRefs: GetThemeRefsOperation,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly setTheme: SetThemeOperation,
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

