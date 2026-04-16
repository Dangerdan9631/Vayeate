import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';
import { findNearestVersionRef } from '../../../utils/find-nearest-version-ref';
import { templateStackId } from '../../../utils/template-stack-id';
import { DeleteTemplateOperation } from '../../../operations/template-operations/template-list/delete-template-operation';
import { LoadTemplateOperation } from '../../../operations/template-operations/template-details/load-template-operation';
import { RefreshTemplateRefsOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from '../../../operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../../operations/template-operations/template-details/set-template-operation';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations/set-current-undo-stack-id-operation';

@singleton()
export class DeleteCurrentTemplateVersionController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly deleteTemplate: DeleteTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(): Promise<void> {
    const selectedRef = this.templatesStore.getStore().state.selectedRef;
    if (!selectedRef) return;

    const { name, version } = selectedRef;
    await this.deleteTemplate.execute(name, version);
    const refs = await this.refreshTemplateRefs.execute();
    const nextT = findNearestVersionRef(refs, name, version);

    if (nextT) {
      this.setSelectedTemplateRef.execute(nextT);
      await this.loadTemplate.execute(nextT.name, nextT.version);
      this.setCurrentUndoStackId.execute(templateStackId(nextT.name, nextT.version));
    } else {
      this.setSelectedTemplateRef.execute(null);
      this.setTemplate.execute(null);
      this.setCurrentUndoStackId.execute(null);
    }
  }
}
