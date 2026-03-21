import { injectable } from 'tsyringe';
import { TemplateService } from '../../../../gateway/services/template-service';
import { StoreStateSetter } from '../../../state/store-state-setter';

/** Load template refs from data dir into store (set template entries from ref list). */
@injectable()
export class LoadTemplateRefs {
  constructor(
    private readonly storeStateSetter: StoreStateSetter,
    private readonly templateService: TemplateService,
  ) {}

  async execute(): Promise<void> {
    const refs = await this.templateService.listTemplates();
    this.storeStateSetter.apply({
      type: 'SET_STORE_TEMPLATE_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
    });
  }
}



