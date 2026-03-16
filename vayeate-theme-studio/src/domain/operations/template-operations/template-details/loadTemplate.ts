import type { Template } from '../../../../model/schemas';
import { templateService } from '../../../../gateway/services/template-service';
import type { SetState } from '../types';

export async function loadTemplate(
  setState: SetState,
  name: string,
  version: string,
): Promise<Template | null> {
  const loaded = await templateService.loadTemplate(name, version);
  setState({ type: 'SET_TEMPLATE', template: loaded });
  return loaded;
}



