import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../utils/version';
import { templateStackId } from '../../../utils/stack-id';
import {
  DeleteTemplate,
  LoadTemplate,
  RefreshTemplateRefs,
  SetSelectedTemplateRef,
  SetTemplate,
} from '../../../operations/template-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';

@singleton()
export class DeleteTemplateVersionController {
  constructor(
    private readonly deleteTemplate: DeleteTemplate,
    private readonly refreshTemplateRefs: RefreshTemplateRefs,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRef,
    private readonly loadTemplate: LoadTemplate,
    private readonly setTemplate: SetTemplate,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
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
