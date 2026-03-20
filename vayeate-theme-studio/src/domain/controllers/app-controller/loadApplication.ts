import type { SetStoreState } from '../../state/store-state-reducer';
import type { SetState } from '../../operations/app-operations';
import { loadCatalogRefs } from '../../operations/catalog-operations';
import { loadTemplateRefs } from '../../operations/template-operations';
import { loadThemeRefs } from '../../operations/theme-operations';
import { clearPersistedUndo } from '../../operations/undo-operations';

export async function loadApplication(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await clearPersistedUndo();

  await loadCatalogRefs(setState, setStoreState);
  await loadTemplateRefs(setState, setStoreState);
  await loadThemeRefs(setState, setStoreState);
}
