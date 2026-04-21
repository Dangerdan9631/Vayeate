import { singleton } from 'tsyringe';
import { LoadCatalogForDisplayOperation } from '../../../domain/operations/catalog-operations/catalog-details/load-catalog-for-display-operation';
import { LoadTemplateOperation } from '../../../domain/operations/template-operations/template-details/load-template-operation';
import { SetSelectedTemplateRefOperation } from '../../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';

@singleton()
export class SelectTemplateAndLoadController {
  constructor(
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly loadTemplate: LoadTemplateOperation,
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
  }
}
