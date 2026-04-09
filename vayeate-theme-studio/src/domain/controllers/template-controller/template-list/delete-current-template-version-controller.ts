import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
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
export class DeleteCurrentTemplateVersionController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly deleteTemplate: DeleteTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(): Promise<void> {
    const selectedRef = this.templatesStateGetter.current().selectedRef;
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
