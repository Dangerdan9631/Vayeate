import type { AppAction } from '../../core/actions/app-action';
import type { TemplateActions } from './template-action-type';
import { TemplateActionType } from './template-action-type';

const templateTypes = new Set<string>(Object.values(TemplateActionType));

export function isTemplateAction(a: AppAction): a is TemplateActions {
  return templateTypes.has(a.type);
}
