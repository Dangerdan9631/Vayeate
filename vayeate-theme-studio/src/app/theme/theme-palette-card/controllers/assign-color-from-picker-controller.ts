import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { createUndoProcessor } from '../../../../domain/core/undo-processor';
import { CommitAssignColorTextOperation } from '../../../../domain/operations/theme-operations/palette-color-assign/commit-assign-color-text-operation';
import { RecordUndoEntryOperation } from '../../../../domain/operations/undo-operations/record-undo-entry-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_PALETTE_COLOR_ASSIGNED } from '../../../../model/undo-action-types';

@singleton()
export class AssignColorFromPickerController {
  constructor(
    private readonly commitAssignColorText: CommitAssignColorTextOperation,
    private readonly themeUiStore: ThemeUiStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(hex: string, _ref?: string): Promise<void> {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return;

    const context = deriveUndoContext({
      tabId: 'themes',
      templateRef: this.templateUiStore.getStore().state.selectedRef ?? theme.templateRef,
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: { name: theme.name, version: theme.version },
    });
    this.setCurrentUndoStackId.executeForContext(context);

    const edit = this.commitAssignColorText.execute(hex);
    if (!edit) return;

    await this.recordUndoEntry.execute({
      completed: edit.changed,
      description: 'Assign palette color',
      diffs: [{
        actionType: THEME_PALETTE_COLOR_ASSIGNED,
        target: `${theme.name}@${theme.version}:palette-selection`,
        before: edit.before,
        after: edit.after,
      }],
      processor: createUndoProcessor([{
        actionType: THEME_PALETTE_COLOR_ASSIGNED,
        apply: (action) => this.commitAssignColorText.restore(action.after as Theme),
        revert: (action) => this.commitAssignColorText.restore(action.before as Theme),
      }]),
    });
  }
}
