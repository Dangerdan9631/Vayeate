import type { SetStoreState } from '../../state/store-state-reducer';
import type { SetState } from '../../operations/app-operations';
import { loadApplication as loadApplicationOp } from '../../operations/app-operations';
import { loadCatalogRefs } from '../../operations/catalog-operations';
import { loadTemplateRefs } from '../../operations/template-operations';
import { loadThemeRefs } from '../../operations/theme-operations';
import { clearPersistedUndo } from '../../operations/undo-operations';

/** Application bootstrap: compose operations (load application stub, clear persisted undo, load refs into app state and store). */
export async function loadApplication(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await loadApplicationOp(setState);
  await clearPersistedUndo();

  await loadCatalogRefs(setState, setStoreState);
  await loadTemplateRefs(setState, setStoreState);
  await loadThemeRefs(setState, setStoreState);
}
