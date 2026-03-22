import { describe, it, expect, vi, afterEach } from 'vitest';
import { FileSystemService } from './file-system-service';

afterEach(() => {
  vi.restoreAllMocks();
  window.electronAPI = undefined;
});

describe('FileSystemService', () => {
  it('createFile forwards to electronAPI.fsCreateFile', async () => {
    const fsCreateFile = vi.fn().mockResolvedValue(undefined);
    window.electronAPI = { fsCreateFile } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new FileSystemService();
    await svc.createFile('data/x.json');
    expect(fsCreateFile).toHaveBeenCalledWith('data/x.json');
  });

  it('saveFile forwards path and contents', async () => {
    const fsSaveFile = vi.fn().mockResolvedValue(undefined);
    window.electronAPI = { fsSaveFile } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new FileSystemService();
    await svc.saveFile('data/x.json', '{"a":1}');
    expect(fsSaveFile).toHaveBeenCalledWith('data/x.json', '{"a":1}');
  });

  it('loadFile returns result from fsLoadFile', async () => {
    const fsLoadFile = vi.fn().mockResolvedValue('body');
    window.electronAPI = { fsLoadFile } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new FileSystemService();
    await expect(svc.loadFile('data/x.json')).resolves.toBe('body');
  });

  it('deleteFile forwards to fsDeleteFile', async () => {
    const fsDeleteFile = vi.fn().mockResolvedValue(undefined);
    window.electronAPI = { fsDeleteFile } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new FileSystemService();
    await svc.deleteFile('data/x.json');
    expect(fsDeleteFile).toHaveBeenCalledWith('data/x.json');
  });

  it('listFiles returns fsListFiles result', async () => {
    const fsListFiles = vi.fn().mockResolvedValue(['a.json', 'b.json']);
    window.electronAPI = { fsListFiles } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new FileSystemService();
    await expect(svc.listFiles('data/catalogs')).resolves.toEqual(['a.json', 'b.json']);
  });

  it('throws when electronAPI is missing', async () => {
    window.electronAPI = undefined;
    const svc = new FileSystemService();
    await expect(svc.createFile('x')).rejects.toThrow(/Electron API not available/);
  });
});
