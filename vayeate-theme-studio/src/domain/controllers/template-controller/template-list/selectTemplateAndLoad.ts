import { singleton } from 'tsyringe';
import { LoadCatalogForDisplay } from '../../../operations/catalog-operations';
import { LoadTemplate, SetSelectedTemplateRef } from '../../../operations/template-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { templateStackId } from '../../../utils/stack-id';

@singleton()
export class SelectTemplateAndLoadController {
  constructor(
    private readonly setSelectedTemplateRef: SetSelectedTemplateRef,
    private readonly loadTemplate: LoadTemplate,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
    private readonly loadCatalogForDisplay: LoadCatalogForDisplay,
  ) {}

  async run(name: string, version: string): Promise<void> {
    const ref = { name, version };
    this.setSelectedTemplateRef.execute(ref);
    const template = await this.loadTemplate.execute(name, version);
    if (template?.catalogRefs?.length) {
      for (const r of template.catalogRefs) {
        await this.loadCatalogForDisplay.execute(r.name, r.version);
      }
    }
    this.setCurrentUndoStackId.execute(templateStackId(name, version));
  }
}
