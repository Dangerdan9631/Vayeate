import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../../domain/utils/find-nearest-version-ref';
import { DeleteThemeOperation } from '../../../../domain/operations/theme-operations/theme-list/delete-theme-operation';
import { LoadThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import { GetThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/get-theme-refs-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { LoadThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/load-theme-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_VERSION_DELETED } from '../../../../model/undo-action-types';

/**
 * Orchestrates delete theme version work for the theme UI.
 */
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
    private readonly themeUiStore: ThemeUiStore,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param name Input for this call.
 * @param version Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(name: string, version: string): Promise<void> {
    const capturedTheme = this.themeUiStore.getStore().state.theme;
    const priorSelectedRef = { name, version };

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: capturedTheme?.templateRef,
      themeRef: priorSelectedRef,
    }));

    this.deleteTheme.execute(name, version);
    this.loadThemeRefs.execute();
    const refs = this.getThemeRefs.execute();
    const nextTh = findNearestVersionRef(refs, name, version);
    const nextRef = nextTh ?? null;

    if (nextTh) {
      this.setSelectedThemeRef.execute(nextTh);
      this.loadTheme.execute(nextTh.name, nextTh.version)
        .then('Loading next theme version', async () => {
          const loadedNextTh = this.themeUiStore.getStore().state.theme;
          if (loadedNextTh) {
            this.setThemePaneSelections.execute(
              loadedNextTh.colorAssignments.map((a) => a.colorRef),
              loadedNextTh.contrastAssignments.map((a) => a.contrastVariableRef),
            );
          } else {
            this.setSelectedThemeRef.execute(null);
            this.setTheme.execute(null);
            this.setThemePaneSelections.execute([], []);
          }
        });
    }

    if (!capturedTheme || capturedTheme.name !== name || capturedTheme.version !== version) return;

    await this.recordThemeUndo.execute({
      description: `Delete theme ${name}@${version}`,
      actionType: THEME_VERSION_DELETED,
      target: `${name}@${version}`,
      before: { theme: capturedTheme, selectedRef: priorSelectedRef },
      after: { theme: null, selectedRef: nextRef },
    });
  }
}
