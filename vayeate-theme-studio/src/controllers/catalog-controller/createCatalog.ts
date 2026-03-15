import {
  createCatalog as createCatalogOperation,
  setCatalog,
  setSelectedRef,
  refreshCatalogRefs,
  type SetState,
} from '../../operations/catalog-operations';
import { setCurrentUndoStackId } from '../../operations/undo-operations';
import { catalogStackId } from './catalogStackId';

export async function createCatalog(
  setState: SetState,
  params: { name: string; type: 'manual' | 'remote' },
): Promise<void> {
  setState({ type: 'SET_IS_CREATING', value: true });
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
  try {
    const catalog = await createCatalogOperation(setState, params);
    await refreshCatalogRefs(setState);
    setCatalog(setState, catalog);
    setSelectedRef(setState, { name: catalog.name, version: catalog.version });
    setCurrentUndoStackId(setState, catalogStackId(catalog.name, catalog.version));
  } finally {
    setState({ type: 'SET_IS_CREATING', value: false });
  }
}
