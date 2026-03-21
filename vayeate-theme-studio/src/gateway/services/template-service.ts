import { singleton } from 'tsyringe';
import type { Template } from '../../model/schemas';

@singleton()
export class TemplateService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async createTemplate(params: { name: string }): Promise<Template> {
    const template = await this.getAPI().createTemplate(params);
    return template;
  }

  async saveTemplate(template: Template): Promise<void> {
    await this.getAPI().saveTemplate(template);
  }

  async loadTemplate(name: string, version: string): Promise<Template | null> {
    const template = await this.getAPI().loadTemplate(name, version);
    return template;
  }

  async listTemplates() {
    const refs = await this.getAPI().listTemplates();
    return refs;
  }

  async deleteTemplate(name: string, version: string): Promise<void> {
    await this.getAPI().deleteTemplate(name, version);
  }
}
