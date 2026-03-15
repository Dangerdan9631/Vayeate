import type { Template } from '../../../model/schemas';
import type { SetState } from './types';

export function setTemplate(setState: SetState, template: Template | null): void {
  setState({ type: 'SET_TEMPLATE', template });
}
