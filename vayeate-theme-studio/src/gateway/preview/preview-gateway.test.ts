import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { PreviewGateway } from './preview-gateway';
import type { FileSystemService } from '../services/file-system-service';
import { initOniguruma, tokenizeFile } from '../../domain/utils/tokenizer';

vi.mock('../../domain/utils/tokenizer', () => ({
  initOniguruma: vi.fn().mockResolvedValue(undefined),
  tokenizeFile: vi.fn().mockResolvedValue([
    { tokens: [{ text: 'x', scopes: ['source.test'] }] },
  ]),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function createFsMock(partial: Partial<FileSystemService> = {}): FileSystemService {
  return {
    createFile: vi.fn().mockResolvedValue(undefined),
    saveFile: vi.fn().mockResolvedValue(undefined),
    loadFile: vi.fn().mockResolvedValue(null),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    listFiles: vi.fn().mockResolvedValue([]),
    listDirEntries: vi.fn().mockResolvedValue([]),
    ...partial,
  } as unknown as FileSystemService;
}

describe('PreviewGateway', () => {
  beforeEach(() => {
    vi.mocked(initOniguruma).mockResolvedValue(undefined);
    vi.mocked(tokenizeFile).mockResolvedValue([
      { tokens: [{ text: 'x', scopes: ['source.test'] }] },
    ]);
  });

  it('loadPreviews returns [] when previews root is missing or unreadable', async () => {
    const listDirEntries = vi.fn().mockRejectedValue(new Error('ENOENT'));
    const gw = new PreviewGateway(createFsMock({ listDirEntries }));
    await expect(gw.loadPreviews()).resolves.toEqual([]);
    expect(listDirEntries).toHaveBeenCalledWith('previews');
  });

  it('loadPreviews walks language dirs, loads grammar + samples, and tokenizes', async () => {
    const grammarJson = JSON.stringify({
      scopeName: 'source.test',
      patterns: [],
    });
    const listDirEntries = vi.fn().mockResolvedValue([{ name: 'ts', isDirectory: true }]);
    const listFiles = vi.fn().mockResolvedValue(['sample.tmLanguage.json', 'hello.ts']);
    const loadFile = vi.fn().mockImplementation(async (rel: string) => {
      if (rel === 'previews/ts/sample.tmLanguage.json') return grammarJson;
      if (rel === 'previews/ts/hello.ts') return 'const x = 1';
      return null;
    });
    const gw = new PreviewGateway(createFsMock({ listDirEntries, listFiles, loadFile }));
    const result = await gw.loadPreviews();
    expect(initOniguruma).toHaveBeenCalled();
    expect(tokenizeFile).toHaveBeenCalled();
    expect(result).toEqual([
      {
        language: 'ts',
        fileName: 'hello.ts',
        lines: [{ tokens: [{ text: 'x', scopes: ['source.test'] }] }],
      },
    ]);
  });
});
