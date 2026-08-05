import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { FileSystemService } from '../src/gateway/services/Common/file-system-service';

function staysWithin(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

/**
 * Node CLI adapter for the renderer-facing package-relative filesystem service.
 */
export class NodeFileSystemService extends FileSystemService {
  constructor(private readonly studioRoot: string = process.cwd()) {
    super();
  }

  private resolvePath(relativePath: string): string {
    const normalized = relativePath.replace(/\\/g, '/');
    let root = resolve(this.studioRoot);
    let pathWithinRoot = normalized;
    if (normalized.startsWith('exthemes/')) {
      root = process.env.THEME_BUILD_OUTPUT_ROOT
        ? resolve(process.env.THEME_BUILD_OUTPUT_ROOT)
        : resolve(this.studioRoot, '..', 'themes');
      pathWithinRoot = normalized.slice('exthemes/'.length);
    }
    const target = resolve(join(root, pathWithinRoot));
    if (!staysWithin(root, target)) {
      throw new Error(`Path escapes configured root: ${relativePath}`);
    }
    return target;
  }

  override async createFile(relativePath: string): Promise<void> {
    const target = this.resolvePath(relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, '', { encoding: 'utf8', flag: 'wx' });
  }

  override async saveFile(relativePath: string, contents: string): Promise<void> {
    const target = this.resolvePath(relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, 'utf8');
  }

  override async loadFile(relativePath: string): Promise<string | null> {
    try {
      return await readFile(this.resolvePath(relativePath), 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  override async deleteFile(relativePath: string): Promise<void> {
    await unlink(this.resolvePath(relativePath));
  }

  override async listFiles(relativeDirPath: string): Promise<string[]> {
    const entries = await readdir(this.resolvePath(relativeDirPath), { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  }

  override async listDirEntries(
    relativeDirPath: string,
  ): Promise<Array<{ name: string; isDirectory: boolean }>> {
    const entries = await readdir(this.resolvePath(relativeDirPath), { withFileTypes: true });
    return entries.map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
    }));
  }
}
