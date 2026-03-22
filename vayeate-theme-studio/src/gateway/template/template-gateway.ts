import { singleton } from 'tsyringe';
import { createTemplateWithParams } from '../../model/factories';
import { templateReferenceSchema, templateSchema } from '../../model/schemas';
import type { Template, TemplateName, TemplateReference, Version } from '../../model/schemas';
import { FileSystemService } from '../services/file-system-service';

const TEMPLATES_RELATIVE_DIR = 'data/templates';

/** Semver at end of filename: optional prerelease and build. */
const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

function fileName(name: TemplateName, version: Version): string {
  return `${name}-${version}.template.json`;
}

function templateRelativeFilePath(name: TemplateName, version: Version): string {
  return `${TEMPLATES_RELATIVE_DIR}/${fileName(name, version)}`;
}

function parseFileName(baseName: string): { name: TemplateName; version: Version } | null {
  if (!baseName.endsWith('.template.json')) return null;
  const withoutExt = baseName.slice(0, -'.template.json'.length);
  const match = FILENAME_VERSION_REGEX.exec(withoutExt);
  if (!match) return null;
  const [, n, ver] = match;
  const refResult = templateReferenceSchema.safeParse({ name: n, version: ver });
  return refResult.success ? refResult.data : null;
}

@singleton()
export class TemplateGateway {
  constructor(private readonly fileSystemService: FileSystemService) {}

  async createTemplate(params: { name: string }): Promise<Template> {
    const template = createTemplateWithParams(params);
    await this.saveTemplate(template);
    return template;
  }

  async saveTemplate(template: Template): Promise<void> {
    const parsed = templateSchema.safeParse(template);
    if (!parsed.success) {
      throw new Error('Invalid template: ' + parsed.error.message);
    }
    const rel = templateRelativeFilePath(parsed.data.name, parsed.data.version);
    await this.fileSystemService.saveFile(rel, JSON.stringify(parsed.data, null, 2));
  }

  async loadTemplate(name: string, version: string): Promise<Template | null> {
    const rel = templateRelativeFilePath(name, version);
    try {
      const raw = await this.fileSystemService.loadFile(rel);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      const result = templateSchema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  async deleteTemplate(name: string, version: string): Promise<void> {
    const rel = templateRelativeFilePath(name, version);
    try {
      await this.fileSystemService.deleteFile(rel);
    } catch {
      // file not found (no-op)
    }
  }

  async listTemplates(): Promise<TemplateReference[]> {
    try {
      const names = await this.fileSystemService.listFiles(TEMPLATES_RELATIVE_DIR);
      const refs: TemplateReference[] = [];
      for (const n of names) {
        const parsed = parseFileName(n);
        if (parsed) refs.push(parsed);
      }
      return refs;
    } catch {
      return [];
    }
  }
}
