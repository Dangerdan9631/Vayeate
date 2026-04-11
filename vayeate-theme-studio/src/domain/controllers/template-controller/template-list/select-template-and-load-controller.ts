import { singleton } from 'tsyringe';
import { LoadCatalogForDisplayOperation } from '../../../operations/catalog-operations/catalog-details/load-catalog-for-display-operation';
import { LoadTemplateOperation } from '../../../operations/template-operations/template-details/load-template-operation';
import { SetSelectedTemplateRefOperation } from '../../../operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations/set-current-undo-stack-id-operation';
import { templateStackId } from '../../../utils/template-stack-id';

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
        this.loadCatalogForDisplay.execute(r.name, r.version);
      }
    }
    this.setCurrentUndoStackId.execute(templateStackId(name, version));
  }
}
