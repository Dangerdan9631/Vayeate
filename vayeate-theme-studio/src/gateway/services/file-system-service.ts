import { singleton } from 'tsyringe';

/**
 * Renderer facade for package-relative filesystem operations via Electron IPC.
 */
@singleton()
export class FileSystemService {
  /**
   * Returns the Electron preload API or throws outside Electron.
   *
   * @returns Preload `electronAPI` with filesystem methods.
   */
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  /**
   * Creates an empty file at a package-relative path.
   *
   * @param relativePath - Path from the app package root.
   * @returns Resolves when the file exists.
   */
  async createFile(relativePath: string): Promise<void> {
    await this.getAPI().fsCreateFile(relativePath);
  }

  /**
   * Writes text to a package-relative file.
   *
   * @param relativePath - Path from the app package root.
   * @param contents - File body to persist.
   * @returns Resolves when the write completes.
   */
  async saveFile(relativePath: string, contents: string): Promise<void> {
    await this.getAPI().fsSaveFile(relativePath, contents);
  }

  /**
   * Reads a package-relative file as text.
   *
   * @param relativePath - Path from the app package root.
   * @returns File contents, or null when the file is missing.
   */
  async loadFile(relativePath: string): Promise<string | null> {
    return this.getAPI().fsLoadFile(relativePath);
  }

  /**
   * Deletes a package-relative file.
   *
   * @param relativePath - Path from the app package root.
   * @returns Resolves when the file is removed.
   */
  async deleteFile(relativePath: string): Promise<void> {
    await this.getAPI().fsDeleteFile(relativePath);
  }

  /**
   * Lists file basenames in a package-relative directory.
   *
   * @param relativeDirPath - Directory path from the app package root.
   * @returns Basenames of files in the directory.
   */
  async listFiles(relativeDirPath: string): Promise<string[]> {
    return this.getAPI().fsListFiles(relativeDirPath);
  }

  /**
   * Lists files and subdirectories under a package-relative directory.
   *
   * @param relativeDirPath - Directory path from the app package root.
   * @returns Entry names with a directory flag per item.
   */
  async listDirEntries(
    relativeDirPath: string,
  ): Promise<Array<{ name: string; isDirectory: boolean }>> {
    return this.getAPI().fsListDirEntries(relativeDirPath);
  }
}
