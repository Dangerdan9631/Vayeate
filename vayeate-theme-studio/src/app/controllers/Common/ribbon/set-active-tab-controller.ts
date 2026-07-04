import { singleton } from 'tsyringe';
import type { TabId } from '../../../../model/Common/app-ui';
import { SetUiActiveTabOperation } from '../../../../domain/operations/Common/app-operations/set-ui-active-tab-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';

/**
 * Switches the active primary tab and aligns the undo stack context.
 */
@singleton()
export class SetActiveTabController {
  constructor(
    private readonly setUiActiveTab: SetUiActiveTabOperation,
    private readonly catalogUiStore?: CatalogUiStore,
    private readonly templateUiStore?: TemplateUiStore,
    private readonly themeUiStore?: ThemeUiStore,
    private readonly setCurrentUndoStackId?: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Updates UI active tab state and reloads undo history for the tab context.
   * @param tabId Target tab; must be a valid primary {@link TabId}.
   */
  run(tabId: TabId): void {
    this.setUiActiveTab.execute(tabId);
    const theme = this.themeUiStore?.getStore().state.theme ?? null;
    this.setCurrentUndoStackId?.executeAndLoadForTab(tabId, deriveUndoContext({
      tabId,
      catalogRef: this.catalogUiStore?.getStore().state.selectedRef ?? null,
      templateRef: tabId === 'themes'
        ? theme?.templateRef ?? this.templateUiStore?.getStore().state.selectedRef ?? null
        : this.templateUiStore?.getStore().state.selectedRef ?? null,
      themeRef: theme
        ? { name: theme.name, version: theme.version }
        : this.themeUiStore?.getStore().state.selectedRef ?? null,
    }));
  }
}
