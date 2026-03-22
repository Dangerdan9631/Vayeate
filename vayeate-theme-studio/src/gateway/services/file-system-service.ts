import { singleton } from 'tsyringe';

@singleton()
export class FileSystemService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async createFile(relativePath: string): Promise<void> {
    await this.getAPI().fsCreateFile(relativePath);
  }

  async saveFile(relativePath: string, contents: string): Promise<void> {
    await this.getAPI().fsSaveFile(relativePath, contents);
  }

  async loadFile(relativePath: string): Promise<string | null> {
    return this.getAPI().fsLoadFile(relativePath);
  }

  async deleteFile(relativePath: string): Promise<void> {
    await this.getAPI().fsDeleteFile(relativePath);
  }

  async listFiles(relativeDirPath: string): Promise<string[]> {
    return this.getAPI().fsListFiles(relativeDirPath);
  }

  /** Files and subdirectories under a package-relative directory (see `fs:listDirEntries` in main). */
  async listDirEntries(
    relativeDirPath: string,
  ): Promise<Array<{ name: string; isDirectory: boolean }>> {
    return this.getAPI().fsListDirEntries(relativeDirPath);
  }
}
