import { describe, it, expect, vi, afterEach } from 'vitest';
import { ConfigGateway } from './config-gateway';
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

describe('ConfigGateway', () => {
  it('save writes JSON to data/config.json', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gw = new ConfigGateway(createFsMock({ saveFile }));
    await gw.save({ colorScheme: 'dark' });
    expect(saveFile).toHaveBeenCalledTimes(1);
    expect(saveFile.mock.calls[0][0]).toBe('data/config.json');
    expect(saveFile.mock.calls[0][1]).toContain('"colorScheme": "dark"');
  });

  it('load reads data/config.json and returns light when stored', async () => {
    const loadFile = vi
      .fn()
      .mockResolvedValue(JSON.stringify({ colorScheme: 'light' }, null, 2));
    const gw = new ConfigGateway(createFsMock({ loadFile }));
    await expect(gw.load()).resolves.toEqual({ colorScheme: 'light' });
    expect(loadFile).toHaveBeenCalledWith('data/config.json');
  });

  it('load returns dark when file is missing', async () => {
    const loadFile = vi.fn().mockResolvedValue(null);
    const gw = new ConfigGateway(createFsMock({ loadFile }));
    await expect(gw.load()).resolves.toEqual({ colorScheme: 'dark' });
  });

  it('load returns dark for empty file or invalid JSON', async () => {
    const gwEmpty = new ConfigGateway(createFsMock({ loadFile: vi.fn().mockResolvedValue('') }));
    await expect(gwEmpty.load()).resolves.toEqual({ colorScheme: 'dark' });

    const gwBad = new ConfigGateway(createFsMock({ loadFile: vi.fn().mockResolvedValue('{') }));
    await expect(gwBad.load()).resolves.toEqual({ colorScheme: 'dark' });
  });

  it('load returns dark when colorScheme is not light', async () => {
    const loadFile = vi.fn().mockResolvedValue(JSON.stringify({ colorScheme: 'dark' }));
    const gw = new ConfigGateway(createFsMock({ loadFile }));
    await expect(gw.load()).resolves.toEqual({ colorScheme: 'dark' });
  });
});
