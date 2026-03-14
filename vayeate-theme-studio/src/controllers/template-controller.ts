import type { Template } from '../model/schemas';
import { compareVersions } from '../utils/version';
import {
  loadTemplateRefs as loadTemplateRefsOp,
  setSelectedTemplateRef,
  loadTemplate,
  setTemplate,
  refreshTemplateRefs,
  saveTemplate as saveTemplateOp,
  deleteTemplate as deleteTemplateOp,
  createTemplate as createTemplateOperation,
  type SetState,
} from '../operations/template-operations';

export interface CreateTemplateParams {
  name: string;
}

export function createTemplateWithParams(params: CreateTemplateParams): Template {
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

export async function loadTemplateRefs(setState: SetState): Promise<void> {
  await loadTemplateRefsOp(setState);
}

export async function selectTemplateAndLoad(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  const ref = { name, version };
  setSelectedTemplateRef(setState, ref);
  await loadTemplate(setState, name, version);
}

export function openTemplateCreateDialog(setState: SetState): void {
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: true });
}

export function closeTemplateCreateDialog(setState: SetState): void {
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
}

async function refreshRefsAndSelect(
  setState: SetState,
  selectName?: string,
  selectVersion?: string,
): Promise<void> {
  const refs = await refreshTemplateRefs(setState);
  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      setSelectedTemplateRef(setState, match);
      await loadTemplate(setState, match.name, match.version);
    }
  }
}

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
  } finally {
    setState({ type: 'SET_TEMPLATE_IS_CREATING', value: false });
  }
}

export async function saveTemplate(
  setState: SetState,
  template: Template,
): Promise<void> {
  await saveTemplateOp(template);
  await refreshRefsAndSelect(setState, template.name, template.version);
}

export async function deleteTemplateVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteTemplateOp(name, version);
  const refs = await refreshTemplateRefs(setState);

  const sameName = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const lowerT = sameName.filter((r) => compareVersions(r.version, version) < 0);
  const higherT = sameName.filter((r) => compareVersions(r.version, version) > 0);
  const nextT =
    lowerT.length > 0 ? lowerT[lowerT.length - 1] : higherT.length > 0 ? higherT[0] : null;

  if (nextT) {
    setSelectedTemplateRef(setState, nextT);
    await loadTemplate(setState, nextT.name, nextT.version);
  } else {
    setSelectedTemplateRef(setState, null);
    setTemplate(setState, null);
  }
}

export async function restoreTemplateState(
  setState: SetState,
  template: Template | null,
  deleteTemplateVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  setTemplate(setState, template);
  if (template !== null) {
    setSelectedTemplateRef(setState, {
      name: template.name,
      version: template.version,
    });
    try {
      await saveTemplateOp(template);
    } catch {
      // persist failed
    }
    await refreshTemplateRefs(setState);
  }
  if (deleteTemplateVersionOnRestore) {
    await deleteTemplateOp(
      deleteTemplateVersionOnRestore.name,
      deleteTemplateVersionOnRestore.version,
    );
    await refreshTemplateRefs(setState);
  }
}
