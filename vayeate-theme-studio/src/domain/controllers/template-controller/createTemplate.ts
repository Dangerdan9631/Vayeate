import {
  createTemplate as createTemplateOperation,
  setTemplate,
  setSelectedTemplateRef,
  refreshTemplateRefs,
  type SetState,
} from '../../operations/template-operations';
import { setCurrentUndoStackId } from '../../operations/undo-operations';
import { templateStackId } from './templateStackId';

export async function createTemplate(
  setState: SetState,
  params: { name: string },
): Promise<void> {
  setState({ type: 'SET_TEMPLATE_IS_CREATING', value: true });
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
  try {
    const newTemplate = await createTemplateOperation(setState, params);
    await refreshTemplateRefs(setState);
    setTemplate(setState, newTemplate);
    setSelectedTemplateRef(setState, {
      name: newTemplate.name,
      version: newTemplate.version,
    });
    setCurrentUndoStackId(setState, templateStackId(newTemplate.name, newTemplate.version));
  } finally {
    setState({ type: 'SET_TEMPLATE_IS_CREATING', value: false });
  }
}
