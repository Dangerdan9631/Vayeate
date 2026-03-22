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
});
