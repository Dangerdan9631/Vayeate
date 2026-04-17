import type { Template } from '../../../../model/schema/template-schemas';
import { singleton } from 'tsyringe';
import { DeleteTemplateOperation } from '../../../operations/template-operations/template-list/delete-template-operation';
import { RefreshTemplateRefsOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { SetSelectedTemplateRefOperation } from '../../../operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../../operations/template-operations/template-details/set-template-operation';

@singleton()
export class RestoreTemplateStateController {
  constructor(
    private readonly setTemplate: SetTemplateOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly deleteTemplate: DeleteTemplateOperation,
  ) {}

  async run(
    template: Template | null,
    deleteTemplateVersionOnRestore?: { name: string; version: string },
  ): Promise<void> {
    this.setTemplate.execute(template);
    if (template !== null) {
      this.setSelectedTemplateRef.execute({
        name: template.name,
        version: template.version,
      });
      try {
        await this.saveTemplate.execute(template);
      } catch {
        // persist failed
      }
      await this.refreshTemplateRefs.execute();
    }
    if (deleteTemplateVersionOnRestore) {
      await this.deleteTemplate.execute(
        deleteTemplateVersionOnRestore.name,
        deleteTemplateVersionOnRestore.version,
      );
      await this.refreshTemplateRefs.execute();
    }
  }
}
