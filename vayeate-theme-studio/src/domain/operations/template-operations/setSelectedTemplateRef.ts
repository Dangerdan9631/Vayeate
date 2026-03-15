import type { TemplateReference } from '../../../model/schemas';
import type { SetState } from './types';

export function setSelectedTemplateRef(
  setState: SetState,
  ref: TemplateReference | null,
): void {
  setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref });
}
