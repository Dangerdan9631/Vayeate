import type { TemplateReference } from '../../../../model/schemas';
import { TemplateService } from '../../../../gateway/services/template-service';
import { injectable } from 'tsyringe';
import { StoreStateSetter } from '../../../state/store-state-setter';

/** List templates and set entries in store. Single responsibility: refresh ref list. */
@injectable()
export class RefreshTemplateRefs {
  constructor(
    private readonly storeStateSetter: StoreStateSetter,
    private readonly templateService: TemplateService,
  ) {}

  /** List templates and set entries in store. Single responsibility: refresh ref list. */
  async execute(): Promise<TemplateReference[]> {
    const refs = await this.templateService.listTemplates();
    this.storeStateSetter.apply({
    type: 'SET_STORE_TEMPLATE_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
    });
    return refs;
  }
}


