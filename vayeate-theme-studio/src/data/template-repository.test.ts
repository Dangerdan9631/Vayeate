/**
 * @vitest-environment node
 */
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTemplateRepository } from './template-repository';
import type { Template } from '../model/schemas';

describe('createTemplateRepository', () => {
  let baseDir: string;

  beforeEach(() => {
    baseDir = mkdtempSync(join(tmpdir(), 'template-repo-test-'));
  });

  afterEach(() => {
    rmSync(baseDir, { recursive: true, force: true });
  });

  const validTemplate: Template = {
    name: 'my-template',
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings: [],
    colorVariables: [],
    contrastVariables: [],
    groups: [],
  };

  it('saves and loads a template round-trip', async () => {
    const repo = createTemplateRepository(baseDir);
    await repo.saveTemplate(validTemplate);
    const loaded = await repo.loadTemplate('my-template', '1.0.0');
    expect(loaded).toEqual(validTemplate);
  });

  it('listTemplates returns saved template references', async () => {
    const repo = createTemplateRepository(baseDir);
    await repo.saveTemplate(validTemplate);
    const list = await repo.listTemplates();
    expect(list).toContainEqual({ name: 'my-template', version: '1.0.0' });
  });

  it('loadTemplate returns null for missing file', async () => {
    const repo = createTemplateRepository(baseDir);
    const loaded = await repo.loadTemplate('missing', '1.0.0');
    expect(loaded).toBeNull();
  });

  it('saveTemplate throws for invalid template', async () => {
    const repo = createTemplateRepository(baseDir);
    const invalid = { ...validTemplate, name: 'invalid name!' } as Template;
    await expect(repo.saveTemplate(invalid)).rejects.toThrow(/Invalid template/);
  });

  it('deleteTemplate removes the file', async () => {
    const repo = createTemplateRepository(baseDir);
    await repo.saveTemplate(validTemplate);
    await repo.deleteTemplate('my-template', '1.0.0');
    const loaded = await repo.loadTemplate('my-template', '1.0.0');
    expect(loaded).toBeNull();
  });

  it('deleteTemplate is a no-op for missing file', async () => {
    const repo = createTemplateRepository(baseDir);
    await expect(repo.deleteTemplate('missing', '1.0.0')).resolves.toBeUndefined();
  });

  it('lists multiple versions for the same name', async () => {
    const repo = createTemplateRepository(baseDir);
    await repo.saveTemplate(validTemplate);
    await repo.saveTemplate({ ...validTemplate, version: '1.0.1' });
    const list = await repo.listTemplates();
    expect(list).toHaveLength(2);
    expect(list).toContainEqual({ name: 'my-template', version: '1.0.0' });
    expect(list).toContainEqual({ name: 'my-template', version: '1.0.1' });
  });

  it('loadTemplate applies default groups and groupRef for legacy JSON', async () => {
    const repo = createTemplateRepository(baseDir);
    const templatesDir = join(baseDir, 'templates');
    mkdirSync(templatesDir, { recursive: true });
    const legacy = {
      name: 'legacy-template',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [
        { token: { key: 'editor.background', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null },
      ],
      colorVariables: [],
      contrastVariables: [],
    };
    writeFileSync(
      join(templatesDir, 'legacy-template-1.0.0.template.json'),
      JSON.stringify(legacy, null, 2),
      'utf-8',
    );
    const loaded = await repo.loadTemplate('legacy-template', '1.0.0');
    expect(loaded).not.toBeNull();
    expect(loaded?.groups).toEqual([]);
    expect(loaded?.mappings[0]?.groupRef).toBeNull();
  });
});
