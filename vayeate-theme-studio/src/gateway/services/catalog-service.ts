import { singleton } from 'tsyringe';
import type { Catalog } from '../../model/schemas';

@singleton()
export class CatalogService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async createCatalog(params: { name: string; type: 'manual' | 'remote' }): Promise<Catalog> {
    const catalog = await this.getAPI().createCatalog(params);
    return catalog;
  }

  async saveCatalog(catalog: Catalog): Promise<void> {
    await this.getAPI().saveCatalog(catalog);
  }

  async loadCatalog(name: string, version: string): Promise<Catalog | null> {
    const catalog = await this.getAPI().loadCatalog(name, version);
    return catalog;
  }

  async listCatalogs() {
    const refs = await this.getAPI().listCatalogs();
    return refs;
  }

  async deleteCatalog(name: string, version: string): Promise<void> {
    await this.getAPI().deleteCatalog(name, version);
  }

  async fetchUrl(url: string): Promise<string> {
    const text = await this.getAPI().fetchUrl(url);
    return text;
  }
}
