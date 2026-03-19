import type { SetStoreState } from '../../../state/store-state-reducer';
import type { SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { addColorVariable } from '../variables-color/addColorVariable';
import { addContrastVariable } from '../variables-contrast/addContrastVariable';

export async function addVariable(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  key: string,
  groupRef: string | null,
  variableKind: 'color' | 'contrast',
): Promise<void> {
  if (variableKind === 'contrast') {
    await addContrastVariable(setState, setStoreState, getState, key.trim(), groupRef);
    return;
  }
  await addColorVariable(setState, setStoreState, getState, key.trim(), groupRef);
}

