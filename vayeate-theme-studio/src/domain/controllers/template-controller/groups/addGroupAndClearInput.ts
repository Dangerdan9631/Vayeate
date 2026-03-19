import type { SetStoreState } from '../../../state/store-state-reducer';
import type { SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { addGroup } from './addGroup';
import { setTemplateAddGroupName } from './setTemplateAddGroupName';

export async function addGroupAndClearInput(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  name: string,
): Promise<void> {
  await addGroup(setState, setStoreState, getState, name);
  setTemplateAddGroupName(setState, '');
}

