import { singleton } from 'tsyringe';
import type { TemplateMappingId } from '../../../../model/template-mapping-assignment';
import { templateMappingIdKey } from '../../../../model/template-mapping-assignment';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/** Applies one checked state to a batch of stable mapping identities. */
@singleton()
export class SetTemplateMappingSelectionBatchOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(ids: readonly TemplateMappingId[], checked: boolean): void {
    if (ids.length === 0) return;

    const current = this.templateUiStore.getStore().state.selectedMappingIds;
    const batchKeys = new Set(ids.map(templateMappingIdKey));
    const next = checked
      ? [
          ...current,
          ...ids.filter(
            (id) => !current.some((candidate) => templateMappingIdKey(candidate) === templateMappingIdKey(id)),
          ),
        ]
      : current.filter((candidate) => !batchKeys.has(templateMappingIdKey(candidate)));

    this.templateUiStore.getStore().setSelectedMappingIds(next);
  }
}
