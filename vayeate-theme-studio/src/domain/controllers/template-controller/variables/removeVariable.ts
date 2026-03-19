import type { SetStoreState } from '../../../state/store-state-reducer';
import type { SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { removeColorVariable } from '../variables-color/removeColorVariable';
import { removeContrastVariable } from '../variables-contrast/removeContrastVariable';

export async function removeVariable(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  key: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;

  if (template.colorVariables.some((variable) => variable.key === key)) {
    await removeColorVariable(setState, setStoreState, getState, key);
    return;
  }

  await removeContrastVariable(setState, setStoreState, getState, key);
}

