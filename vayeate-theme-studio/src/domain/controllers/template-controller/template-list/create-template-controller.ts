import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  CreateTemplateOperation,
  RefreshTemplateRefsOperation,
  SetSelectedTemplateRefOperation,
  SetTemplateOperation,
} from '../../../operations/template-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { SetTemplateCreateDialogOpenOperation } from '../../../operations/template-operations/template-list/set-template-create-dialog-open-operation';
import { SetTemplateIsCreatingOperation } from '../../../operations/template-operations/template-list/set-template-is-creating-operation';
import { templateStackId } from '../../../utils/stack-id';

@singleton()
export class CreateTemplateController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly createTemplate: CreateTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation,
    private readonly setTemplateIsCreating: SetTemplateIsCreatingOperation,
  ) {}

  async run(): Promise<void> {
    const name = this.templatesStateGetter.current().createFormName.trim();
    if (!name) return;

    this.setTemplateIsCreating.execute(true);
    this.setTemplateCreateDialogOpen.execute(false);
    try {
      const newTemplate = await this.createTemplate.execute({ name });
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
      this.setTemplateIsCreating.execute(false);
    }
  }
}
