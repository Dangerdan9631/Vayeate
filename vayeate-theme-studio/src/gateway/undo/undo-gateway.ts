import { singleton } from 'tsyringe';
import { FileSystemService } from '../services/file-system-service';
import { UndoPersistencePort } from '../../domain/operations/undo-operations/undo-persistence-port';

const UNDO_RELATIVE_DIR = 'data/.undo';

function sanitizeStackId(stackId: string): string {
  return stackId.replace(/[\\/:*?"<>|+]/g, '_');
}

function stackRelativeFilePath(stackId: string): string {
  return `${UNDO_RELATIVE_DIR}/${sanitizeStackId(stackId)}.json`;
}

@singleton()
export class UndoGateway extends UndoPersistencePort {
  constructor(private readonly fileSystemService: FileSystemService) {
    super();
  }

  async saveStack(stackId: string, payload: string): Promise<void> {
    if (!stackId) return;
    await this.fileSystemService.saveFile(stackRelativeFilePath(stackId), payload);
  }

  async loadStack(stackId: string): Promise<string | null> {
    if (!stackId) return null;
    try {
      return await this.fileSystemService.loadFile(stackRelativeFilePath(stackId));
    } catch {
      return null;
    }
  }

  async deleteStack(stackId: string): Promise<void> {
    const rel = stackRelativeFilePath(stackId);
    try {
      await this.fileSystemService.deleteFile(rel);
    } catch {
      // missing file — no-op
    }
  }

  /** Basenames in `data/.undo` (e.g. `foo_bar.json`). */
  async listStackFiles(): Promise<string[]> {
    try {
      return await this.fileSystemService.listFiles(UNDO_RELATIVE_DIR);
    } catch {
      return [];
    }
  }

  /** Removes all persisted undo stack files under `data/.undo`. */
  async clearPersisted(): Promise<void> {
    let names: string[];
    try {
      names = await this.fileSystemService.listFiles(UNDO_RELATIVE_DIR);
    } catch {
      return;
    }
    await Promise.all(names.map((n) => this.fileSystemService.deleteFile(`${UNDO_RELATIVE_DIR}/${n}`).catch(() => undefined)));
  }
}
