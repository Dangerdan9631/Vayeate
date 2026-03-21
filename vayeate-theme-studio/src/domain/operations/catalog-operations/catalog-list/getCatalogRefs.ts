import { injectable } from 'tsyringe';
import { getCatalogRefsFromStore } from '../../../state/store-state';
import type { CatalogReference } from '../../../../model/schemas';
import { AppStateGetter } from '../../../state/app-state-getter';

/** Read current catalog refs from state. Use in controllers instead of importing domain/state directly. */
@injectable()
export class GetCatalogRefs {
  constructor(private readonly appStateGetter: AppStateGetter) {}

  execute(): CatalogReference[] {
    return getCatalogRefsFromStore(this.appStateGetter.current().store);
  }
}


