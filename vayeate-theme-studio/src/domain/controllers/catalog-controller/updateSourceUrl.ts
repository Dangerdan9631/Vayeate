import type { Catalog } from '../../../model/schemas';
import {
  saveCatalog as saveCatalogOp,
  type SetState,
} from '../../operations/catalog-operations';
import type { GetState } from '../../operations/undo-operations';
import { catalogWithVersionBump, refreshRefsAndSelect } from './_helpers';

export async function updateSourceUrl(
  setState: SetState,
  getState: GetState,
  sourceIndex: number,
  value: string,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog || sourceIndex < 0 || sourceIndex >= catalog.sources.length) return;
  const sources = catalog.sources.map((s, i) =>
    i === sourceIndex ? { ...s, url: value.trim() } : s,
  );
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = { ...base, sources };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}
