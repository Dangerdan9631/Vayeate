import type { Template } from '../../model/schemas';

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const templateService = {
  createTemplate: async (params: { name: string }): Promise<Template> => {
    const template = await getAPI().createTemplate(params);
    return template;
  },
  saveTemplate: async (template: Template): Promise<void> => {
    await getAPI().saveTemplate(template);
  },
  loadTemplate: async (name: string, version: string): Promise<Template | null> => {
    const template = await getAPI().loadTemplate(name, version);
    return template;
  },
  listTemplates: async () => {
    const refs = await getAPI().listTemplates();
    return refs;
  },
  deleteTemplate: async (name: string, version: string): Promise<void> => {
    await getAPI().deleteTemplate(name, version);
  },
};
