import type { Template } from '../model/schemas';
import { createLogger } from '../utils/logger';

const log = createLogger('TemplateService');

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const templateService = {
  createTemplate: async (params: { name: string }): Promise<Template> => {
    log.debug('IPC template:create', params.name);
    const template = await getAPI().createTemplate(params);
    log.debug('IPC template:create →', template.name, `v${template.version}`);
    return template;
  },
  saveTemplate: async (template: Template): Promise<void> => {
    log.debug('IPC template:save', template.name, `v${template.version}`,
      `(${template.mappings.length} mappings)`);
    await getAPI().saveTemplate(template);
    log.debug('IPC template:save complete');
  },
  loadTemplate: async (name: string, version: string): Promise<Template | null> => {
    log.debug('IPC template:load', name, `v${version}`);
    const template = await getAPI().loadTemplate(name, version);
    log.debug('IPC template:load →', template ? `${template.mappings.length} mapping(s)` : '(not found)');
    return template;
  },
  listTemplates: async () => {
    log.debug('IPC template:list');
    const refs = await getAPI().listTemplates();
    log.debug('IPC template:list →', refs.length, 'ref(s)');
    return refs;
  },
  deleteTemplate: async (name: string, version: string): Promise<void> => {
    log.debug('IPC template:delete', name, `v${version}`);
    await getAPI().deleteTemplate(name, version);
    log.debug('IPC template:delete complete');
  },
};
