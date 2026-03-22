import { describe, it, expect, vi, afterEach } from 'vitest';
import { UndoGateway } from './undo-gateway';
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

describe('UndoGateway', () => {
  it('saveStack writes under data/.undo with sanitized filename', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gw = new UndoGateway(createFsMock({ saveFile }));
    await gw.saveStack('a:b|c', '{"x":1}');
    expect(saveFile).toHaveBeenCalledWith('data/.undo/a_b_c.json', '{"x":1}');
  });

  it('saveStack no-ops when stackId is empty', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gw = new UndoGateway(createFsMock({ saveFile }));
    await gw.saveStack('', '{}');
    expect(saveFile).not.toHaveBeenCalled();
  });

  it('loadStack returns file contents', async () => {
    const loadFile = vi.fn().mockResolvedValue('{"ok":true}');
    const gw = new UndoGateway(createFsMock({ loadFile }));
    await expect(gw.loadStack('stack-1')).resolves.toBe('{"ok":true}');
    expect(loadFile).toHaveBeenCalledWith('data/.undo/stack-1.json');
  });

  it('loadStack returns null when stackId is empty', async () => {
    const loadFile = vi.fn();
    const gw = new UndoGateway(createFsMock({ loadFile }));
    await expect(gw.loadStack('')).resolves.toBeNull();
    expect(loadFile).not.toHaveBeenCalled();
  });

  it('loadStack returns null when loadFile throws', async () => {
    const loadFile = vi.fn().mockRejectedValue(new Error('boom'));
    const gw = new UndoGateway(createFsMock({ loadFile }));
    await expect(gw.loadStack('x')).resolves.toBeNull();
  });

  it('deleteStack calls deleteFile with expected path', async () => {
    const deleteFile = vi.fn().mockResolvedValue(undefined);
    const gw = new UndoGateway(createFsMock({ deleteFile }));
    await gw.deleteStack('n');
    expect(deleteFile).toHaveBeenCalledWith('data/.undo/n.json');
  });

  it('deleteStack swallows deleteFile errors', async () => {
    const deleteFile = vi.fn().mockRejectedValue(new Error('ENOENT'));
    const gw = new UndoGateway(createFsMock({ deleteFile }));
    await expect(gw.deleteStack('n')).resolves.toBeUndefined();
  });

  it('listStackFiles delegates to listFiles', async () => {
    const listFiles = vi.fn().mockResolvedValue(['a.json', 'b.json']);
    const gw = new UndoGateway(createFsMock({ listFiles }));
    await expect(gw.listStackFiles()).resolves.toEqual(['a.json', 'b.json']);
    expect(listFiles).toHaveBeenCalledWith('data/.undo');
  });

  it('listStackFiles returns empty array when listFiles throws', async () => {
    const listFiles = vi.fn().mockRejectedValue(new Error('no dir'));
    const gw = new UndoGateway(createFsMock({ listFiles }));
    await expect(gw.listStackFiles()).resolves.toEqual([]);
  });

  it('clearPersisted deletes each file in data/.undo', async () => {
    const listFiles = vi.fn().mockResolvedValue(['one.json', 'two.json']);
    const deleteFile = vi.fn().mockResolvedValue(undefined);
    const gw = new UndoGateway(createFsMock({ listFiles, deleteFile }));
    await gw.clearPersisted();
    expect(deleteFile).toHaveBeenCalledWith('data/.undo/one.json');
    expect(deleteFile).toHaveBeenCalledWith('data/.undo/two.json');
  });

  it('clearPersisted no-ops when listFiles throws', async () => {
    const listFiles = vi.fn().mockRejectedValue(new Error('missing'));
    const deleteFile = vi.fn();
    const gw = new UndoGateway(createFsMock({ listFiles, deleteFile }));
    await gw.clearPersisted();
    expect(deleteFile).not.toHaveBeenCalled();
  });
});
