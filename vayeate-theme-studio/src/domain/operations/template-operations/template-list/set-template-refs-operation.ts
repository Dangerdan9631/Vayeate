import type { TemplateReference } from '../../../../model/schemas';
import { injectable } from 'tsyringe';
import { StoreStateSetter } from '../../../state/store-state-setter';

@injectable()
export class SetTemplateRefsOperation {
  constructor(private readonly storeStateSetter: StoreStateSetter) {}

  execute(refs: TemplateReference[]): void {
    this.storeStateSetter.apply({
    type: 'SET_STORE_TEMPLATE_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
    });
  }
}


