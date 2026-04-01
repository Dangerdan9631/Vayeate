import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../utils/version';
import { templateStackId } from '../../../utils/stack-id';
import {
  DeleteTemplateOperation,
  LoadTemplateOperation,
  RefreshTemplateRefsOperation,
  SetSelectedTemplateRefOperation,
  SetTemplateOperation,
} from '../../../operations/template-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';

@singleton()
export class DeleteTemplateVersionController {
  constructor(
    private readonly deleteTemplate: DeleteTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(name: string, version: string): Promise<void> {
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
