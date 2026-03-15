import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { templateReferenceSchema, templateSchema } from '../../model/schemas.js';
import type { Template, TemplateName, TemplateReference, Version } from '../../model/schemas.js';

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

  return {
    async saveTemplate(template: Template): Promise<void> {
      const parsed = templateSchema.safeParse(template);
      if (!parsed.success) {
        throw new Error('Invalid template: ' + parsed.error.message);
      }
      await mkdir(dir, { recursive: true });
      const path = filePath(baseDir, template.name, template.version);
      await writeFile(path, JSON.stringify(parsed.data, null, 2), 'utf-8');
    },

    async loadTemplate(name: TemplateName, version: Version): Promise<Template | null> {
      const path = filePath(baseDir, name, version);
      try {
        const raw = await readFile(path, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        const result = templateSchema.safeParse(parsed);
        if (result.success) {
          return result.data;
        }
        return null;
      } catch {
        return null;
      }
    },

    async deleteTemplate(name: TemplateName, version: Version): Promise<void> {
      const path = filePath(baseDir, name, version);
      try {
        await unlink(path);
      } catch {
        // file not found (no-op)
      }
    },

    async listTemplates(): Promise<TemplateReference[]> {
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        const refs: TemplateReference[] = [];
        for (const ent of entries) {
          if (!ent.isFile()) continue;
          const parsed = parseFileName(ent.name);
          if (parsed) refs.push(parsed);
        }
        return refs;
      } catch {
        return [];
      }
    },
  };
}

export type TemplateRepository = ReturnType<typeof createTemplateRepository>;
