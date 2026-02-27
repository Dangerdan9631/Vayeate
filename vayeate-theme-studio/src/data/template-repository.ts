import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { templateReferenceSchema, templateSchema } from '../model/schemas.js';
import type { Template, TemplateName, TemplateReference, Version } from '../model/schemas.js';

const TAG = '[TemplateRepo]';
const TEMPLATES_DIR = 'templates';

const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

function templatesPath(baseDir: string): string {
  return join(baseDir, TEMPLATES_DIR);
}

function fileName(name: TemplateName, version: Version): string {
  return `${name}-${version}.template.json`;
}

function filePath(baseDir: string, name: TemplateName, version: Version): string {
  return join(templatesPath(baseDir), fileName(name, version));
}

function parseFileName(baseName: string): { name: TemplateName; version: Version } | null {
  if (!baseName.endsWith('.template.json')) return null;
  const withoutExt = baseName.slice(0, -'.template.json'.length);
  const match = FILENAME_VERSION_REGEX.exec(withoutExt);
  if (!match) return null;
  const [, name, version] = match;
  const refResult = templateReferenceSchema.safeParse({ name, version });
  return refResult.success ? refResult.data : null;
}

export function createTemplateRepository(baseDir: string) {
  const dir = templatesPath(baseDir);
  console.debug(TAG, 'initialized with dir:', dir);

  return {
    async saveTemplate(template: Template): Promise<void> {
      console.debug(TAG, 'saveTemplate', template.name, `v${template.version}`,
        `(${template.mappings.length} mappings)`);
      const parsed = templateSchema.safeParse(template);
      if (!parsed.success) {
        console.error(TAG, 'saveTemplate validation failed:', parsed.error.message);
        throw new Error('Invalid template: ' + parsed.error.message);
      }
      await mkdir(dir, { recursive: true });
      const path = filePath(baseDir, template.name, template.version);
      await writeFile(path, JSON.stringify(parsed.data, null, 2), 'utf-8');
      console.debug(TAG, 'saveTemplate written to', path);
    },

    async loadTemplate(name: TemplateName, version: Version): Promise<Template | null> {
      const path = filePath(baseDir, name, version);
      console.debug(TAG, 'loadTemplate', name, `v${version}`, 'from', path);
      try {
        const raw = await readFile(path, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        const result = templateSchema.safeParse(parsed);
        if (result.success) {
          console.debug(TAG, 'loadTemplate →', result.data.mappings.length, 'mapping(s)');
          return result.data;
        }
        console.warn(TAG, 'loadTemplate validation failed for', path);
        return null;
      } catch {
        console.debug(TAG, 'loadTemplate file not found or unreadable:', path);
        return null;
      }
    },

    async deleteTemplate(name: TemplateName, version: Version): Promise<void> {
      const path = filePath(baseDir, name, version);
      console.debug(TAG, 'deleteTemplate', name, `v${version}`, path);
      try {
        await unlink(path);
        console.debug(TAG, 'deleteTemplate removed', path);
      } catch {
        console.debug(TAG, 'deleteTemplate file not found (no-op):', path);
      }
    },

    async listTemplates(): Promise<TemplateReference[]> {
      console.debug(TAG, 'listTemplates scanning', dir);
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        const refs: TemplateReference[] = [];
        for (const ent of entries) {
          if (!ent.isFile()) continue;
          const parsed = parseFileName(ent.name);
          if (parsed) refs.push(parsed);
        }
        console.debug(TAG, 'listTemplates →', refs.length, 'ref(s)');
        return refs;
      } catch {
        console.debug(TAG, 'listTemplates directory does not exist yet, returning empty');
        return [];
      }
    },
  };
}

export type TemplateRepository = ReturnType<typeof createTemplateRepository>;
