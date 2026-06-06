import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Dirent, Stats } from 'node:fs';

const handle = vi.fn();
const on = vi.fn();
const mockFetchText = vi.fn(async () => 'payload');
const mockFetch = vi.fn(async () => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  text: mockFetchText,
}));

vi.mock('electron', () => ({
  desktopCapturer: {
    getSources: vi.fn(),
  },
  ipcMain: {
    handle,
    on,
  },
  net: {
    fetch: mockFetch,
  },
  screen: {
    getAllDisplays: vi.fn(() => []),
  },
}));

const resolveSafeProjectRelativePath = vi.fn((rel: string) => `safe:${rel}`);
const resolveExthemesExportFile = vi.fn((rel: string) => `ext:${rel}`);

vi.mock('../../electron/paths', () => ({
  resolveSafeProjectRelativePath,
  resolveExthemesExportFile,
}));

function createDirectoryStats(): Stats {
  return Object.assign({}, {
    isDirectory: () => true,
  }) as Stats;
}

function createDirent(name: string, isDirectory: boolean): Dirent {
  return Object.assign({}, {
    name,
    isFile: () => !isDirectory,
    isDirectory: () => isDirectory,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isSymbolicLink: () => false,
    isFIFO: () => false,
    isSocket: () => false,
  }) as Dirent;
}

describe('ipc handler registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('registers filesystem, network, and window handlers', async () => {
    const fsPromises = await import('node:fs/promises');
    vi.spyOn(fsPromises, 'mkdir').mockResolvedValue(undefined);
    vi.spyOn(fsPromises, 'writeFile').mockResolvedValue(undefined);
    vi.spyOn(fsPromises, 'readFile').mockResolvedValue('file-contents');
    vi.spyOn(fsPromises, 'unlink').mockResolvedValue(undefined);
    const stats = createDirectoryStats();
    const dirents = [createDirent('one.json', false), createDirent('nested', true)];
    vi.spyOn(fsPromises, 'stat').mockResolvedValue(stats);
    vi.spyOn(fsPromises, 'readdir').mockImplementation(
      async () => dirents as unknown as Awaited<ReturnType<typeof fsPromises.readdir>>,
    );

    const { registerIpcHandlers } = await import('../../electron/ipc-handlers');
    const mockWindow = {
      close: vi.fn(),
      minimize: vi.fn(),
      maximize: vi.fn(),
      unmaximize: vi.fn(),
      reload: vi.fn(),
      isDestroyed: vi.fn(() => false),
      getBounds: vi.fn(() => ({ x: 1, y: 2, width: 3, height: 4 })),
      webContents: {
        toggleDevTools: vi.fn(),
        session: {
          clearCache: vi.fn(async () => {}),
        },
      },
    };

    registerIpcHandlers(() => mockWindow as never);

    const registered = new Map<string, (...args: unknown[]) => unknown>();
    for (const call of handle.mock.calls) {
      registered.set(call[0] as string, call[1] as (...args: unknown[]) => unknown);
    }

    expect(registered.has('fs:saveFile')).toBe(true);
    expect(registered.has('fs:loadFile')).toBe(true);
    expect(registered.has('net:fetch')).toBe(true);
    expect(registered.has('window:getBounds')).toBe(true);

    await registered.get('fs:saveFile')?.({}, 'data/test.json', '{}');
    await registered.get('fs:saveFile')?.({}, 'exthemes/theme.json', '{}');
    await expect(registered.get('fs:loadFile')?.({}, 'data/test.json')).resolves.toBe('file-contents');
    await expect(registered.get('fs:listFiles')?.({}, 'data')).resolves.toEqual(['one.json']);
    await expect(registered.get('net:fetch')?.({}, 'https://example.test')).resolves.toBe('payload');
    expect(registered.get('window:getBounds')?.()).toEqual({ x: 1, y: 2, width: 3, height: 4 });

    expect(resolveSafeProjectRelativePath).toHaveBeenCalledWith('data/test.json', 'file');
    expect(resolveExthemesExportFile).toHaveBeenCalledWith('exthemes/theme.json');
    expect(mockFetch).toHaveBeenCalledWith('https://example.test');
  });

  it('returns null for missing files and zero bounds when no window exists', async () => {
    const fsPromises = await import('node:fs/promises');
    vi.spyOn(fsPromises, 'readFile').mockRejectedValueOnce({ code: 'ENOENT' });

    const { registerIpcHandlers } = await import('../../electron/ipc-handlers');
    registerIpcHandlers(() => null);

    const registered = new Map<string, (...args: unknown[]) => unknown>();
    for (const call of handle.mock.calls) {
      registered.set(call[0] as string, call[1] as (...args: unknown[]) => unknown);
    }

    await expect(registered.get('fs:loadFile')?.({}, 'data/missing.json')).resolves.toBeNull();
    expect(registered.get('window:getBounds')?.()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});
