import { singleton } from 'tsyringe';
import { DeleteTemplateOperation } from '../../../../domain/operations/template-operations/template-list/delete-template-operation';
import { RefreshTemplateRefsOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { SetSelectedTemplateRefOperation } from '../../../../domain/operations/template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../../../../domain/operations/template-operations/template-details/set-template-operation';
import type { RestoreTemplateStateParams } from '../../../../domain/operations/template-operations/types';

@singleton()
export class RestoreTemplateStateController {
  constructor(
    private readonly setTemplate: SetTemplateOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly deleteTemplate: DeleteTemplateOperation,
  ) {}

  async run(params: RestoreTemplateStateParams): Promise<void> {
    if (params.template !== undefined) {
      this.setTemplate.execute(params.template);
    }

    if (params.template !== undefined && params.template !== null) {
      this.setSelectedTemplateRef.execute({
        name: params.template.name,
        version: params.template.version,
      });
      try {
        this.saveTemplate.execute(params.template);
      } catch {
        // persist failed
      }
      this.refreshTemplateRefs.execute();
    }

    if (params.deleteTemplateVersionOnRestore) {
      this.deleteTemplate.execute(
        params.deleteTemplateVersionOnRestore.name,
        params.deleteTemplateVersionOnRestore.version,
      );
      this.refreshTemplateRefs.execute();
    }
  }
}
