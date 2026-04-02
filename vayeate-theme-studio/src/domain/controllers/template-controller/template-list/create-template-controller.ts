import { singleton } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';
import {
  CreateTemplateOperation,
  RefreshTemplateRefsOperation,
  SetSelectedTemplateRefOperation,
  SetTemplateOperation,
} from '../../../operations/template-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { templateStackId } from '../../../utils/stack-id';

@singleton()
export class CreateTemplateController {
  constructor(
    private readonly templatesStateSetter: TemplatesStateSetter,
    private readonly createTemplate: CreateTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(params: { name: string }): Promise<void> {
    this.templatesStateSetter.apply({ type: 'SET_TEMPLATE_IS_CREATING', value: true });
    this.templatesStateSetter.apply({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
    try {
      const newTemplate = await this.createTemplate.execute(params);
      await this.refreshTemplateRefs.execute();
      this.setTemplate.execute(newTemplate);
      this.setSelectedTemplateRef.execute({
        name: newTemplate.name,
        version: newTemplate.version,
      });
      this.setCurrentUndoStackId.execute(
        templateStackId(newTemplate.name, newTemplate.version),
      );
    } finally {
      this.templatesStateSetter.apply({ type: 'SET_TEMPLATE_IS_CREATING', value: false });
    }
  }
}
