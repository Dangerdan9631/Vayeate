import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { nextPatchVersion } from '../../../../domain/utils/next-patch-version';
import { ClearPendingThemeSaveOperation } from '../../../../domain/operations/theme-operations/theme-details/clear-pending-theme-save-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SaveThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/save-theme-operation';
import { SetThemeSaveErrorOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-save-error-operation';
import { LoadThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_VERSION_INCREMENTED } from '../../../../model/undo-action-types';

/**
 * Orchestrates increment theme version work for the theme UI.
 */
@singleton()
export class IncrementThemeVersionController {
  constructor(
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly saveTheme: SaveThemeOperation,
    private readonly setThemeSaveError: SetThemeSaveErrorOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setTheme: SetThemeOperation,
    private readonly clearPendingThemeSave: ClearPendingThemeSaveOperation,
    private readonly themeUiStore: ThemeUiStore,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @returns Promise resolved when orchestration completes.
   */
  async run(): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    if (!theme) return;

    const priorSelectedRef = { name: theme.name, version: theme.version };
    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: priorSelectedRef,
    }));

    const newVersion = nextPatchVersion(theme.version);
    const bumped: Theme = { ...theme, version: newVersion };
    this.clearPendingThemeSave.execute();
    this.setThemeHueAdjustment.execute(0);
    try {
      this.saveTheme.execute(bumped);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setThemeSaveError.execute(message);
      return;
    }
    this.loadThemeRefs.execute();
    const newRef = { name: theme.name, version: newVersion };
    this.setSelectedThemeRef.execute(newRef);
    this.setTheme.execute(bumped, true);
    this.setThemePaneSelections.execute(
      bumped.colorAssignments.map((a) => a.colorRef),
      bumped.contrastAssignments.map((a) => a.contrastVariableRef),
    );

    await this.recordThemeUndo.execute({
      description: 'Increment theme version',
      actionType: THEME_VERSION_INCREMENTED,
      target: `${theme.name}@${newVersion}`,
      before: { theme: null, selectedRef: priorSelectedRef },
      after: { theme: bumped, selectedRef: newRef },
    });
  }
}
