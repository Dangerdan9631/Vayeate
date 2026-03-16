import {
  setSelectedRef,
  loadCatalog,
  type SetState,
} from '../../../operations/catalog-operations';
import { setCurrentUndoStackId } from '../../../operations/undo-operations';
import { catalogStackId } from './catalogStackId';

export async function selectCatalogAndLoad(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  const ref = { name, version };
  setSelectedRef(setState, ref);
  await loadCatalog(setState, name, version);
  setCurrentUndoStackId(setState, catalogStackId(name, version));
}

