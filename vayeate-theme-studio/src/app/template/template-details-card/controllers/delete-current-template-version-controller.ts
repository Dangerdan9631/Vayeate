import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../../domain/utils/find-nearest-version-ref';
import { DeleteTemplateOperation } from '../../../../domain/operations/template-operations/template-list/delete-template-operation';
import { LoadTemplateOperation } from '../../../../domain/operations/template-operations/template-details/load-template-operation';
import { RefreshTemplateRefsOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from '../../../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../../../domain/operations/template-operations/template-details/set-template-operation';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';

@singleton()
export class DeleteCurrentTemplateVersionController {
  constructor(
    private readonly templateUiStore: TemplateUiStore,
    private readonly deleteTemplate: DeleteTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
    private readonly setTemplate: SetTemplateOperation,
  ) {}

  async run(): Promise<void> {
    const selectedRef = this.templateUiStore.getStore().state.selectedRef;
    if (!selectedRef) return;

    const { name, version } = selectedRef;
    this.deleteTemplate.execute(name, version);
    const refs = await this.refreshTemplateRefs.execute();
    const nextT = findNearestVersionRef(refs, name, version);

    if (nextT) {
      this.setSelectedTemplateRef.execute(nextT);
      this.loadTemplate.execute(nextT.name, nextT.version);
    } else {
      this.setSelectedTemplateRef.execute(null);
      this.setTemplate.execute(null);
    }
  }
}
