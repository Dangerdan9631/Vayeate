import type { Template } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import {
  DeleteTemplate,
  RefreshTemplateRefs,
  SaveTemplate,
  SetSelectedTemplateRef,
  SetTemplate,
} from '../../../operations/template-operations';

@singleton()
export class RestoreTemplateStateController {
  constructor(
    private readonly setTemplate: SetTemplate,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRef,
    private readonly saveTemplate: SaveTemplate,
    private readonly refreshTemplateRefs: RefreshTemplateRefs,
    private readonly deleteTemplate: DeleteTemplate,
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
