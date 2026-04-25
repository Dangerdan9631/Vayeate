import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../../domain/state/template/templates-store';
import { CreateTemplateOperation } from '../../../../domain/operations/template-operations/template-list/create-template-operation';
import { RefreshTemplateRefsOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from '../../../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../../../domain/operations/template-operations/template-details/set-template-operation';
import { SetTemplateCreateDialogOpenOperation } from '../../../../domain/operations/template-operations/template-list/set-template-create-dialog-open-operation';
import { SetTemplateIsCreatingOperation } from '../../../../domain/operations/template-operations/template-list/set-template-is-creating-operation';

@singleton()
export class CreateTemplateController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly createTemplate: CreateTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly setTemplate: SetTemplateOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
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
      this.refreshTemplateRefs.execute();
      this.setTemplate.execute(newTemplate);
      this.setSelectedTemplateRef.execute({
        name: newTemplate.name,
        version: newTemplate.version,
      });
    } finally {
      this.setTemplateIsCreating.execute(false);
    }
  }
}
