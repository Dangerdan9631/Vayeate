import type { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import type { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import type { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import type { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import type { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { THEME_PANE_SELECTIONS_SET } from '../../../../model/undo-action-types';
import { deriveUndoContext } from '../../../../model/undo-history';

export interface ThemePaneSelectionsUndoValue {
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
}

export async function recordThemePaneSelectionUndo(
  recordThemeUndo: RecordThemeUndoOperation,
  setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  themeUiStore: ThemeUiStore,
  templateUiStore: TemplateUiStore,
  catalogUiStore: CatalogUiStore,
  input: {
    description: string;
    before: ThemePaneSelectionsUndoValue;
    after: ThemePaneSelectionsUndoValue;
  },
): Promise<void> {
  const theme = themeUiStore.getStore().state.theme;
  if (!theme) return;

  const context = deriveUndoContext({
    tabId: 'themes',
    templateRef: templateUiStore.getStore().state.selectedRef ?? theme.templateRef,
    catalogRef: catalogUiStore.getStore().state.selectedRef,
    themeRef: { name: theme.name, version: theme.version },
  });
  setCurrentUndoStackId.executeForContext(context);

  await recordThemeUndo.execute({
    description: input.description,
    actionType: THEME_PANE_SELECTIONS_SET,
    target: `${theme.name}@${theme.version}:pane-selections`,
    before: input.before,
    after: input.after,
  });
}
