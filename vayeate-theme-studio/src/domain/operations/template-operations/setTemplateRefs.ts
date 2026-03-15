import type { TemplateReference } from '../../../model/schemas';
import type { SetState } from './types';

export function setTemplateRefs(setState: SetState, refs: TemplateReference[]): void {
  setState({ type: 'SET_TEMPLATE_REFS', refs });
}
