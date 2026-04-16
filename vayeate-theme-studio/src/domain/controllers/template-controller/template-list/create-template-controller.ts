import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';
import { CreateTemplateOperation } from '../../../operations/template-operations/template-list/create-template-operation';
import { RefreshTemplateRefsOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from '../../../operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../../operations/template-operations/template-details/set-template-operation';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations/set-current-undo-stack-id-operation';
import { SetTemplateCreateDialogOpenOperation } from '../../../operations/template-operations/template-list/set-template-create-dialog-open-operation';
import { SetTemplateIsCreatingOperation } from '../../../operations/template-operations/template-list/set-template-is-creating-operation';
import { templateStackId } from '../../../utils/template-stack-id';

@singleton()
export class CreateTemplateController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly createTemplate: CreateTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation,
    private readonly setTemplateIsCreating: SetTemplateIsCreatingOperation,
  ) {}

  async run(): Promise<void> {
    const name = this.templatesStore.getStore().state.createFormName.trim();
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
