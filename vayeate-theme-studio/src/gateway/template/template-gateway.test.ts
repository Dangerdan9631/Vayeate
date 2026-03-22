import { describe, it, expect, vi, afterEach } from 'vitest';
import { createTemplateWithParams } from '../../model/factories';
import { TemplateGateway } from './template-gateway';
import type { FileSystemService } from '../services/file-system-service';

afterEach(() => {
  vi.restoreAllMocks();
});

function createFsMock(partial: Partial<FileSystemService> = {}): FileSystemService {
  return {
    createFile: vi.fn().mockResolvedValue(undefined),
    saveFile: vi.fn().mockResolvedValue(undefined),
    loadFile: vi.fn().mockResolvedValue(null),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    listFiles: vi.fn().mockResolvedValue([]),
    ...partial,
  } as unknown as FileSystemService;
}

describe('TemplateGateway', () => {
  it('saveTemplate writes JSON under data/templates with expected filename', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gw = new TemplateGateway(createFsMock({ saveFile }));
    const template = createTemplateWithParams({ name: 'dotnet' });
    await gw.saveTemplate(template);
    expect(saveFile).toHaveBeenCalledTimes(1);
    expect(saveFile.mock.calls[0][0]).toBe('data/templates/dotnet-1.0.0.template.json');
    expect(saveFile.mock.calls[0][1]).toContain('"name": "dotnet"');
  });

  it('createTemplate persists then returns the new template', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gw = new TemplateGateway(createFsMock({ saveFile }));
    const template = await gw.createTemplate({ name: 'foo' });
    expect(template.name).toBe('foo');
    expect(saveFile).toHaveBeenCalledWith('data/templates/foo-1.0.0.template.json', expect.any(String));
  });

  it('loadTemplate returns parsed template when file is valid JSON', async () => {
    const stored = createTemplateWithParams({ name: 'bar' });
    const loadFile = vi.fn().mockResolvedValue(JSON.stringify(stored));
    const gw = new TemplateGateway(createFsMock({ loadFile }));
    const loaded = await gw.loadTemplate('bar', '1.0.0');
    expect(loadFile).toHaveBeenCalledWith('data/templates/bar-1.0.0.template.json');
    expect(loaded).toEqual(stored);
  });

  it('loadTemplate returns null when loadFile returns null', async () => {
    const loadFile = vi.fn().mockResolvedValue(null);
    const gw = new TemplateGateway(createFsMock({ loadFile }));
    await expect(gw.loadTemplate('x', '1.0.0')).resolves.toBeNull();
  });

  it('listTemplates maps filenames via parseFileName and returns refs', async () => {
    const listFiles = vi.fn().mockResolvedValue(['dotnet-csharp-1.0.0.template.json', 'ignore.txt']);
    const gw = new TemplateGateway(createFsMock({ listFiles }));
    const refs = await gw.listTemplates();
    expect(listFiles).toHaveBeenCalledWith('data/templates');
    expect(refs).toContainEqual({ name: 'dotnet-csharp', version: '1.0.0' });
    expect(refs).toHaveLength(1);
  });

  it('listTemplates returns empty array when listFiles throws', async () => {
    const listFiles = vi.fn().mockRejectedValue(new Error('no dir'));
    const gw = new TemplateGateway(createFsMock({ listFiles }));
    await expect(gw.listTemplates()).resolves.toEqual([]);
  });

  it('deleteTemplate swallows deleteFile errors', async () => {
    const deleteFile = vi.fn().mockRejectedValue(new Error('ENOENT'));
    const gw = new TemplateGateway(createFsMock({ deleteFile }));
    await expect(gw.deleteTemplate('n', '1.0.0')).resolves.toBeUndefined();
    expect(deleteFile).toHaveBeenCalledWith('data/templates/n-1.0.0.template.json');
  });
});
