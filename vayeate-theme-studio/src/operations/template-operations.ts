import type { Template, TemplateReference } from '../model/schemas';
import type { AppStateUpdate } from '../state/app-state';
import { templateService } from '../services/template-service';

export type SetState = (update: AppStateUpdate) => void;

export function setTemplateRefs(setState: SetState, refs: TemplateReference[]): void {
  setState({ type: 'SET_TEMPLATE_REFS', refs });
}

export function setSelectedTemplateRef(
  setState: SetState,
  ref: TemplateReference | null,
): void {
  setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref });
}

export function setTemplate(setState: SetState, template: Template | null): void {
  setState({ type: 'SET_TEMPLATE', template });
}

export async function loadTemplateRefs(setState: SetState): Promise<TemplateReference[]> {
  const refs = await templateService.listTemplates();
  setState({ type: 'SET_TEMPLATE_REFS', refs });
  return refs;
}

export async function createTemplate(
  _setState: SetState,
  params: { name: string },
): Promise<Template> {
  const template = await templateService.createTemplate(params);
  return template;
}

export async function loadTemplate(
  setState: SetState,
  name: string,
  version: string,
): Promise<Template | null> {
  const loaded = await templateService.loadTemplate(name, version);
  setState({ type: 'SET_TEMPLATE', template: loaded });
  return loaded;
}

/** List templates and set refs in state. Single responsibility: refresh ref list. */
export async function refreshTemplateRefs(setState: SetState): Promise<TemplateReference[]> {
  const refs = await templateService.listTemplates();
  setState({ type: 'SET_TEMPLATE_REFS', refs });
  return refs;
}

/** Persist template to disk only. Single responsibility: save. */
export async function saveTemplate(template: Template): Promise<void> {
  await templateService.saveTemplate(template);
}

/** Delete one template version from disk. Single responsibility: delete. */
export async function deleteTemplate(name: string, version: string): Promise<void> {
  await templateService.deleteTemplate(name, version);
}
