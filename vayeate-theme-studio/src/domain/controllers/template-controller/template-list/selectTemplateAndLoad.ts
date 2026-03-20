import {
  setSelectedTemplateRef,
  loadTemplate,
  type SetState,
} from '../../../operations/template-operations';
import { setCurrentUndoStackId } from '../../../operations/undo-operations';
import * as catalogController from '../../catalog-controller';
import { templateStackId } from '../../../utils/stack-id';

export async function selectTemplateAndLoad(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  const ref = { name, version };
  setSelectedTemplateRef(setState, ref);
  const template = await loadTemplate(setState, name, version);
  if (template?.catalogRefs?.length) {
    await catalogController.loadCatalogsForDisplay(
      setState,
      template.catalogRefs.map((r) => ({ name: r.name, version: r.version })),
    );
  }
  setCurrentUndoStackId(setState, templateStackId(name, version));
}

