import type { SetStoreState } from '../../../state/store-state-reducer';
import { loadTemplateRefs as loadTemplateRefsOp, type SetState } from '../../../operations/template-operations';
import * as catalogController from '../../catalog-controller';

/** Load template refs and catalog refs for the template page. */
export async function loadTemplatePage(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await loadTemplateRefsOp(setState, setStoreState);
  await catalogController.loadCatalogRefs(setState, setStoreState);
}

