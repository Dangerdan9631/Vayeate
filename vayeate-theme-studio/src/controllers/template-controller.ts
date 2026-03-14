import type { Template } from '../model/schemas';
import {
  loadTemplateRefs,
  setSelectedTemplateRef,
  loadTemplate,
  setTemplate,
  refreshTemplateRefsAndSelect,
  saveTemplateAndRefresh,
  deleteTemplateVersion,
  restoreTemplateState,
  createTemplate as createTemplateOperation,
  type SetState,
} from '../operations/template-operations';
import { createLogger } from '../utils/logger';

const log = createLogger('TemplateController');

export interface CreateTemplateParams {
  name: string;
}

export function createTemplateWithParams(params: CreateTemplateParams): Template {
  log.debug('createTemplateWithParams', params.name);
  return {
    name: params.name,
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings: [],
    colorVariables: [],
    contrastVariables: [],
    groups: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };
}

export async function handleTemplatePageOnLoad(setState: SetState): Promise<void> {
  log.debug('handleTemplatePageOnLoad');
  await loadTemplateRefs(setState);
}

export async function handleTemplateListOnSelect(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  log.debug('handleTemplateListOnSelect', name, `v${version}`);
  const ref = { name, version };
  setSelectedTemplateRef(setState, ref);
  await loadTemplate(setState, name, version);
}

export function handleCreateDialogOnOpen(setState: SetState): void {
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: true });
}

export function handleCreateDialogOnClose(setState: SetState): void {
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
}

export async function handleCreateFormOnSubmit(
  setState: SetState,
  params: { name: string },
): Promise<void> {
  log.debug('handleCreateFormOnSubmit', params);
  setState({ type: 'SET_TEMPLATE_IS_CREATING', value: true });
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
  try {
    const newTemplate = await createTemplateOperation(setState, params);
    await refreshTemplateRefsAndSelect(setState, newTemplate.name, newTemplate.version);
    setTemplate(setState, newTemplate);
    setSelectedTemplateRef(setState, {
      name: newTemplate.name,
      version: newTemplate.version,
    });
  } finally {
    setState({ type: 'SET_TEMPLATE_IS_CREATING', value: false });
  }
}

export async function handleSaveButtonOnClick(
  setState: SetState,
  template: Template,
): Promise<void> {
  log.debug('handleSaveButtonOnClick', template.name, template.version);
  await saveTemplateAndRefresh(template, setState);
}

export async function handleVersionDeleteButtonOnClick(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteTemplateVersion(setState, name, version);
}

export async function handleUndoPanelRestoreTemplate(
  setState: SetState,
  template: Template | null,
  deleteTemplateVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  await restoreTemplateState(setState, template, deleteTemplateVersionOnRestore);
}
