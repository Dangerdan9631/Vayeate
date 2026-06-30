import { singleton } from 'tsyringe';
import { createTemplateWithParams } from '../../model/factories/template-factory';
import { templateSchema } from '../../model/schema/template-schemas';
import { templateReferenceSchema } from '../../model/schema/theme-schemas';
import type { TemplateName, Version } from '../../model/schema/primitives';
import type { Template } from '../../model/schema/template-schemas';
import type { TemplateReference } from '../../model/schema/theme-schemas';
import { FileSystemService } from '../services/file-system-service';

/**
 * Package-relative path: Theme Studio root `data/templates/`.
 */
const TEMPLATES_RELATIVE_DIR = 'data/templates';

/**
 * Semver at end of filename: optional prerelease and build.
 */
const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

/**
 * Builds the on-disk template filename for a name and version pair.
 *
 * @param name - Template name segment of the filename.
 * @param version - Semver segment of the filename.
 * @returns Filename in the form `<name>-<version>.template.json`.
 */
function fileName(name: TemplateName, version: Version): string {
  return `${name}-${version}.template.json`;
}

/**
 * Resolves the package-relative path for a template JSON file.
 *
 * @param name - Template name.
 * @param version - Template version.
 * @returns Path under `data/templates/`.
 */
function templateRelativeFilePath(name: TemplateName, version: Version): string {
  return `${TEMPLATES_RELATIVE_DIR}/${fileName(name, version)}`;
}

/**
 * Parses a template filename (without path) into name and version, or null if not valid.
 *
 * @param baseName - Filename including extension.
 * @returns Parsed reference, or null when the name does not match the expected pattern.
 */
function parseFileName(baseName: string): { name: TemplateName; version: Version } | null {
  if (!baseName.endsWith('.template.json')) return null;
  const withoutExt = baseName.slice(0, -'.template.json'.length);
  const match = FILENAME_VERSION_REGEX.exec(withoutExt);
  if (!match) return null;
  const [, n, ver] = match;
  const refResult = templateReferenceSchema.safeParse({ name: n, version: ver });
  return refResult.success ? refResult.data : null;
}

/**
 * Persists templates under `data/templates/` with zod validation on read and write.
 */
@singleton()
export class TemplateGateway {
  constructor(private readonly fileSystemService: FileSystemService) {}

  /**
   * Creates a new template from factory defaults and saves it to disk.
   *
   * @param params - Creation parameters (currently template name).
   * @returns The created and persisted template.
   */
  async createTemplate(params: { name: string }): Promise<Template> {
    const template = createTemplateWithParams(params);
    await this.saveTemplate(template);
    return template;
  }

  /**
   * Validates and writes a template JSON file for its name and version.
   *
   * @param template - Domain template to persist.
   * @returns Resolves when the file is saved.
   */
  async saveTemplate(template: Template): Promise<void> {
    const parsed = templateSchema.safeParse(template);
    if (!parsed.success) {
      throw new Error('Invalid template: ' + parsed.error.message);
    }
    const rel = templateRelativeFilePath(parsed.data.name, parsed.data.version);
    await this.fileSystemService.saveFile(rel, JSON.stringify(parsed.data));
  }

  /**
   * Loads and parses a template file by name and version.
   *
   * @param name - Template name.
   * @param version - Template version.
   * @returns Parsed template, or null when missing or invalid.
   */
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

  /**
   * Deletes a template file; missing files are ignored.
   *
   * @param name - Template name.
   * @param version - Template version.
   * @returns Resolves when delete completes or the file is absent.
   */
  async deleteTemplate(name: string, version: string): Promise<void> {
    const rel = templateRelativeFilePath(name, version);
    try {
      await this.fileSystemService.deleteFile(rel);
    } catch {
      // file not found (no-op)
    }
  }

  /**
   * Lists template name/version pairs inferred from filenames in `data/templates/`.
   *
   * @returns Valid template references, or an empty list on I/O failure.
   */
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
