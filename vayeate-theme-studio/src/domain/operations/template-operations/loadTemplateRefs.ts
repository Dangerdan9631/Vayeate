import { templateService } from '../../../gateway/services/template-service';
import type { SetStoreState } from '../../../state/store-state-reducer';
import type { SetState } from './types';

/** Load template refs from data dir into app state and store (entries with isLoaded: false). */
export async function loadTemplateRefs(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  const refs = await templateService.listTemplates();
  setState({ type: 'SET_TEMPLATE_REFS', refs });
  setStoreState({
    type: 'SET_STORE_TEMPLATE_ENTRIES',
    entries: refs.map((ref) => ({ name: ref.name, version: ref.version, isLoaded: false, template: undefined })),
  });
}
