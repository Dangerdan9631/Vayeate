import type { SetState } from '../../../operations/catalog-operations';
import { LoadCatalogForDisplay } from '../../../operations/catalog-operations';
import { LoadTemplate, SetSelectedTemplateRef } from '../../../operations/template-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { templateStackId } from '../../../utils/stack-id';
import { container } from 'tsyringe';

/** @param _setState retained for call-site compatibility; state updates use DI `AppStateSetter`. */
export async function selectTemplateAndLoad(
  _setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  const setSelectedTemplateRef = container.resolve(SetSelectedTemplateRef);
  const loadTemplate = container.resolve(LoadTemplate);
  const setCurrentUndoStackId = container.resolve(SetCurrentUndoStackId);

  const ref = { name, version };
  setSelectedTemplateRef.execute(ref);
  const template = await loadTemplate.execute(name, version);
  if (template?.catalogRefs?.length) {
    const loadCatalogForDisplay = container.resolve(LoadCatalogForDisplay);
    for (const r of template.catalogRefs) {
      await loadCatalogForDisplay.execute(r.name, r.version);
    }
  }
  setCurrentUndoStackId.execute(templateStackId(name, version));
}
