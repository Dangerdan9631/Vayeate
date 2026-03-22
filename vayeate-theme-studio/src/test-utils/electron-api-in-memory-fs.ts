import type { Catalog, Template, Theme } from '../model/schemas';

/**
 * Writes a catalog JSON file at `data/catalogs/<name>-<version>.json`.
 */
export function seedCatalogFile(files: Map<string, string>, catalog: Catalog): void {
  files.set(`data/catalogs/${catalog.name}-${catalog.version}.json`, JSON.stringify(catalog));
}

/**
 * Writes a template JSON file at `data/templates/<name>-<version>.template.json`.
 */
export function seedTemplateFile(files: Map<string, string>, template: Template): void {
  files.set(`data/templates/${template.name}-${template.version}.template.json`, JSON.stringify(template));
}

/**
 * Writes a theme JSON file at `data/themes/<name>-<version>.theme.json`.
 */
export function seedThemeFile(files: Map<string, string>, theme: Theme): void {
  files.set(`data/themes/${theme.name}-${theme.version}.theme.json`, JSON.stringify(theme));
}

/**
 * In-memory file map for tests that exercise catalog/template/theme gateways via {@link FileSystemService}.
 * Paths use forward slashes as in production (e.g. `data/catalogs/name-1.0.0.json`).
 */
export function createInMemoryFsElectronApi(options?: {
  fetchUrl?: () => Promise<string>;
  /** Override fsSaveFile (e.g. return a deferred promise). */
  fsSaveFile?: (path: string, contents: string) => Promise<void>;
}): {
  files: Map<string, string>;
  fsCreateFile: (path: string) => Promise<void>;
  fsSaveFile: (path: string, contents: string) => Promise<void>;
  fsLoadFile: (path: string) => Promise<string | null>;
  fsDeleteFile: (path: string) => Promise<void>;
  fsListFiles: (dir: string) => Promise<string[]>;
  fetchUrl: () => Promise<string>;
} {
  const files = new Map<string, string>();
  const normDir = (d: string) => (d.endsWith('/') ? d : `${d}/`);

  const fsSaveFile =
    options?.fsSaveFile ??
    (async (rel: string, contents: string) => {
      files.set(rel, contents);
    });

  return {
    files,
    fsCreateFile: async (rel) => {
      if (files.has(rel)) throw new Error('EEXIST');
      files.set(rel, '');
    },
    fsSaveFile,
    fsLoadFile: async (rel) => files.get(rel) ?? null,
    fsDeleteFile: async (rel) => {
      files.delete(rel);
    },
    fsListFiles: async (relDir) => {
      const p = normDir(relDir);
      const out: string[] = [];
      for (const k of files.keys()) {
        if (!k.startsWith(p)) continue;
        const rest = k.slice(p.length);
        if (rest.includes('/')) continue;
        out.push(rest);
      }
      return out;
    },
    fetchUrl: options?.fetchUrl ?? (() => Promise.resolve('')),
  };
}
