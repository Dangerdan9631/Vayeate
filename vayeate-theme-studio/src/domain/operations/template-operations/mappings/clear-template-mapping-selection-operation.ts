import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/** Clears transient template mapping selection. */
@singleton()
export class ClearTemplateMappingSelectionOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(): void {
    this.templateUiStore.getStore().setSelectedMappingIds([]);
  }
}
