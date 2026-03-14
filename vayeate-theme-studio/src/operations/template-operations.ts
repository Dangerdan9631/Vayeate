import type { Template, TemplateReference } from '../model/schemas';
import type { AppStateUpdate } from '../state/app-state';
import { templateService } from '../services/template-service';
import { compareVersions } from '../utils/version';
import { createLogger } from '../utils/logger';

const log = createLogger('TemplateOperations');

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
  log.debug('loaded', refs.length, 'template ref(s)');
  setState({ type: 'SET_TEMPLATE_REFS', refs });
  return refs;
}

export async function createTemplate(
  _setState: SetState,
  params: { name: string },
): Promise<Template> {
  const template = await templateService.createTemplate(params);
  log.debug('created template', template.name, `v${template.version}`);
  return template;
}

export async function loadTemplate(
  setState: SetState,
  name: string,
  version: string,
): Promise<Template | null> {
  const loaded = await templateService.loadTemplate(name, version);
  log.debug(
    'loaded template',
    loaded ? `${loaded.mappings.length} mapping(s)` : '(not found)',
  );
  setState({ type: 'SET_TEMPLATE', template: loaded });
  return loaded;
}

export async function refreshTemplateRefsAndSelect(
  setState: SetState,
  selectName?: string,
  selectVersion?: string,
): Promise<void> {
  log.debug('refreshTemplateRefsAndSelect', selectName, selectVersion);
  const refs = await templateService.listTemplates();
  log.debug('loaded', refs.length, 'template ref(s)');
  setState({ type: 'SET_TEMPLATE_REFS', refs });

  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      log.debug('selecting template', match.name, match.version);
      setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref: match });
      await loadTemplate(setState, match.name, match.version);
    } else {
      log.debug('no matching template ref for', selectName, selectVersion);
    }
  }
}

export async function saveTemplateAndRefresh(
  template: Template,
  setState: SetState,
): Promise<void> {
  log.debug('saveTemplateAndRefresh', template.name, template.version);
  await templateService.saveTemplate(template);
  await refreshTemplateRefsAndSelect(setState, template.name, template.version);
}

export async function deleteTemplateVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  log.debug('deleteTemplateVersion', name, `v${version}`);
  await templateService.deleteTemplate(name, version);
  const refs = await templateService.listTemplates();
  setState({ type: 'SET_TEMPLATE_REFS', refs });

  const sameName = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));

  const lowerT = sameName.filter((r) => compareVersions(r.version, version) < 0);
  const higherT = sameName.filter((r) => compareVersions(r.version, version) > 0);
  const nextT =
    lowerT.length > 0 ? lowerT[lowerT.length - 1] : higherT.length > 0 ? higherT[0] : null;

  if (nextT) {
    log.debug('deleteTemplateVersion fallback to', nextT.name, `v${nextT.version}`);
    setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref: nextT });
    await loadTemplate(setState, nextT.name, nextT.version);
  } else {
    log.debug('deleteTemplateVersion no remaining versions, clearing selection');
    setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref: null });
    setState({ type: 'SET_TEMPLATE', template: null });
  }
}

export async function restoreTemplateState(
  setState: SetState,
  template: Template | null,
  deleteTemplateVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  setState({ type: 'SET_TEMPLATE', template });
  if (template !== null) {
    setState({
      type: 'SET_SELECTED_TEMPLATE_REF',
      ref: { name: template.name, version: template.version },
    });
    try {
      await saveTemplateAndRefresh(template, setState);
    } catch (err) {
      log.error('restoreTemplateState persist failed', err);
    }
  }
  if (deleteTemplateVersionOnRestore) {
    await templateService.deleteTemplate(
      deleteTemplateVersionOnRestore.name,
      deleteTemplateVersionOnRestore.version,
    );
    const refs = await templateService.listTemplates();
    setState({ type: 'SET_TEMPLATE_REFS', refs });
  }
}
