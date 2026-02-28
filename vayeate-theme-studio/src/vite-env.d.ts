/// <reference types="vite/client" />

import type { Catalog, CatalogReference, Template, TemplateReference, Theme, ThemeReference } from './model/schemas';
import type { TokenizedPreview } from './core/tokenizer';

declare global {
  interface Window {
    electronAPI?: {
      saveCatalog: (catalog: Catalog) => Promise<void>;
      loadCatalog: (name: string, version: string) => Promise<Catalog | null>;
      listCatalogs: () => Promise<CatalogReference[]>;
      createCatalog: (params: { name: string; type: 'manual' | 'remote' }) => Promise<Catalog>;
      deleteCatalog: (name: string, version: string) => Promise<void>;
      createTemplate: (params: { name: string }) => Promise<Template>;
      saveTemplate: (template: Template) => Promise<void>;
      loadTemplate: (name: string, version: string) => Promise<Template | null>;
      listTemplates: () => Promise<TemplateReference[]>;
      deleteTemplate: (name: string, version: string) => Promise<void>;
      createTheme: (params: { name: string }) => Promise<Theme>;
      saveTheme: (theme: Theme) => Promise<void>;
      loadTheme: (name: string, version: string) => Promise<Theme | null>;
      listThemes: () => Promise<ThemeReference[]>;
      deleteTheme: (name: string, version: string) => Promise<void>;
      generateTheme: (
        themeName: string,
        themeVersion: string,
        templateName: string,
        templateVersion: string,
      ) => Promise<{ darkPath: string; lightPath: string }>;
      fetchUrl: (url: string) => Promise<string>;
      loadPreviews: () => Promise<TokenizedPreview[]>;
    };
  }
}

export {};
