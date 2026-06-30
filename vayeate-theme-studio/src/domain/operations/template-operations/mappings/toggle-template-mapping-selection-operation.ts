import { singleton } from 'tsyringe';
import type { TemplateMappingId } from '../../../../model/template-mapping-assignment';
import { templateMappingIdKey } from '../../../../model/template-mapping-assignment';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/** Toggles one stable mapping identity in transient template UI selection. */
@singleton()
export class ToggleTemplateMappingSelectionOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(id: TemplateMappingId): void {
    const current = this.templateUiStore.getStore().state.selectedMappingIds;
    const key = templateMappingIdKey(id);
    const exists = current.some((candidate) => templateMappingIdKey(candidate) === key);
    const next = exists
      ? current.filter((candidate) => templateMappingIdKey(candidate) !== key)
      : [...current, id];
    this.templateUiStore.getStore().setSelectedMappingIds(next);
  }
}
