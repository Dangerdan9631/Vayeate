import { singleton } from 'tsyringe';
import type { TabId } from '../../../../model/app-ui';
import { SetUiActiveTabOperation } from '../../../../domain/operations/app-operations/set-ui-active-tab-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';

@singleton()
export class SetActiveTabController {
  constructor(
    private readonly setUiActiveTab: SetUiActiveTabOperation,
    private readonly catalogUiStore?: CatalogUiStore,
    private readonly templateUiStore?: TemplateUiStore,
    private readonly themeUiStore?: ThemeUiStore,
    private readonly setCurrentUndoStackId?: SetCurrentUndoStackIdOperation,
  ) {}

  async run(tabId: TabId): Promise<void> {
    this.setUiActiveTab.execute(tabId);
    const theme = this.themeUiStore?.getStore().state.theme ?? null;
    await this.setCurrentUndoStackId?.executeAndLoadForTab(tabId, deriveUndoContext({
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
