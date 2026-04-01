import { singleton } from 'tsyringe';
import { LoadCatalogForDisplayOperation } from '../../../operations/catalog-operations';
import { LoadTemplateOperation, SetSelectedTemplateRefOperation } from '../../../operations/template-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { templateStackId } from '../../../utils/stack-id';

@singleton()
export class SelectTemplateAndLoadController {
  constructor(
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly loadCatalogForDisplay: LoadCatalogForDisplayOperation,
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
