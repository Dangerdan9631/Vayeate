import { describe, expect, it, vi } from 'vitest';
import { UndoGateway } from './undo-gateway';

describe('undo gateway', () => {
  it('saves and loads sanitized stack files under data/.undo', async () => {
    const fileSystem = {
      saveFile: vi.fn(),
      loadFile: vi.fn(async () => '{"frames":[]}'),
      deleteFile: vi.fn(),
      listFiles: vi.fn(),
    };
    const gateway = new UndoGateway(fileSystem as never);

    await gateway.saveStack('theme:dark/1', '{"frames":[]}');
    await expect(gateway.loadStack('theme:dark/1')).resolves.toBe('{"frames":[]}');

    expect(fileSystem.saveFile).toHaveBeenCalledWith('data/.undo/theme_dark_1.json', '{"frames":[]}');
    expect(fileSystem.loadFile).toHaveBeenCalledWith('data/.undo/theme_dark_1.json');
  });

  it('returns null for missing stack files', async () => {
    const gateway = new UndoGateway({
      saveFile: vi.fn(),
      loadFile: vi.fn(async () => {
        throw new Error('missing');
      }),
      deleteFile: vi.fn(),
      listFiles: vi.fn(),
    } as never);

    await expect(gateway.loadStack('missing')).resolves.toBeNull();
  });

  it('propagates save failures so policy can avoid unsafe undo entries', async () => {
    const gateway = new UndoGateway({
      saveFile: vi.fn(async () => {
        throw new Error('disk full');
      }),
      loadFile: vi.fn(),
      deleteFile: vi.fn(),
      listFiles: vi.fn(),
    } as never);

    await expect(gateway.saveStack('theme:dark', '{"frames":[]}')).rejects.toThrow('disk full');
  });

  it('lists persisted stack files and handles a missing undo directory', async () => {
    const fileSystem = {
      saveFile: vi.fn(),
      loadFile: vi.fn(),
      deleteFile: vi.fn(),
      listFiles: vi.fn(async () => ['one.json']),
    };
    const gateway = new UndoGateway(fileSystem as never);

    await expect(gateway.listStackFiles()).resolves.toEqual(['one.json']);
    fileSystem.listFiles.mockRejectedValueOnce(new Error('missing'));
    await expect(gateway.listStackFiles()).resolves.toEqual([]);
  });

  it('clears persisted stack files under data/.undo', async () => {
    const fileSystem = {
      saveFile: vi.fn(),
      loadFile: vi.fn(),
      deleteFile: vi.fn(async () => undefined),
      listFiles: vi.fn(async () => ['one.json', 'two.json']),
    };
    const gateway = new UndoGateway(fileSystem as never);

    await gateway.clearPersisted();

    expect(fileSystem.deleteFile).toHaveBeenCalledWith('data/.undo/one.json');
    expect(fileSystem.deleteFile).toHaveBeenCalledWith('data/.undo/two.json');
  });
});
