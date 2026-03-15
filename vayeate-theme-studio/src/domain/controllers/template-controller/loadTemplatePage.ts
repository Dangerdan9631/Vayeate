import { loadTemplateRefs as loadTemplateRefsOp, type SetState } from '../../operations/template-operations';
import * as catalogController from '../catalog-controller';

/** Load template refs and catalog refs for the template page. */
export async function loadTemplatePage(setState: SetState): Promise<void> {
  await loadTemplateRefsOp(setState);
  await catalogController.loadCatalogRefs(setState);
}
