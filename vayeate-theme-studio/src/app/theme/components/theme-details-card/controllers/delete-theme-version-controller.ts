import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../../../domain/utils/find-nearest-version-ref';
import { DeleteThemeOperation } from '../../../../../domain/operations/theme-operations/theme-list/delete-theme-operation';
import { LoadThemeRefsOperation } from '../../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import { GetThemeRefsOperation } from '../../../../../domain/operations/theme-operations/theme-list/get-theme-refs-operation';
import { SetSelectedThemeRefOperation } from '../../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { LoadThemeOperation } from '../../../../../domain/operations/theme-operations/theme-details/load-theme-operation';
import { SetThemePaneSelectionsOperation } from '../../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetThemeOperation } from '../../../../../domain/operations/theme-operations/theme-details/set-theme-operation';

@singleton()
export class DeleteThemeVersionController {
  constructor(
    private readonly deleteTheme: DeleteThemeOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly getThemeRefs: GetThemeRefsOperation,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setTheme: SetThemeOperation,
  ) {}

  async run(name: string, version: string): Promise<void> {
    this.deleteTheme.execute(name, version);
    this.loadThemeRefs.execute();
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
    } else {
      this.setSelectedThemeRef.execute(null);
      this.setTheme.execute(null);
      this.setThemePaneSelections.execute([], []);
    }
  }
}

