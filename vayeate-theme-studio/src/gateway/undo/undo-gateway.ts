import { singleton } from 'tsyringe';
import { FileSystemService } from '../services/file-system-service';
import { UndoPersistencePort } from '../../domain/operations/undo-operations/undo-persistence-port';

/**
 * Package-relative directory for persisted undo stack JSON files.
 */
const UNDO_RELATIVE_DIR = 'data/.undo';

/**
 * Replaces characters unsafe in filenames with underscores.
 *
 * @param stackId - Raw undo stack identifier.
 * @returns Sanitized id safe for use in a file basename.
 */
function sanitizeStackId(stackId: string): string {
  return stackId.replace(/[\\/:*?"<>|+]/g, '_');
}

/**
 * Resolves the package-relative path for one undo stack file.
 *
 * @param stackId - Undo stack identifier.
 * @returns Path under `data/.undo/`.
 */
function stackRelativeFilePath(stackId: string): string {
  return `${UNDO_RELATIVE_DIR}/${sanitizeStackId(stackId)}.json`;
}

/**
 * File-backed implementation of undo stack persistence under `data/.undo/`.
 */
@singleton()
export class UndoGateway extends UndoPersistencePort {
  constructor(private readonly fileSystemService: FileSystemService) {
    super();
  }

  /**
   * Writes a serialized undo stack payload to disk.
   *
   * @param stackId - Stack identifier; empty ids are ignored.
   * @param payload - JSON string to persist.
   * @returns Resolves when the file is saved.
   */
  async saveStack(stackId: string, payload: string): Promise<void> {
    if (!stackId) return;
    await this.fileSystemService.saveFile(stackRelativeFilePath(stackId), payload);
  }

  /**
   * Reads a persisted undo stack payload by id.
   *
   * @param stackId - Stack identifier; empty ids yield null.
   * @returns File contents, or null when missing or on read failure.
   */
  async loadStack(stackId: string): Promise<string | null> {
    if (!stackId) return null;
    try {
      return await this.fileSystemService.loadFile(stackRelativeFilePath(stackId));
    } catch {
      return null;
    }
  }

  /**
   * Deletes one undo stack file; missing files are ignored.
   *
   * @param stackId - Stack identifier.
   * @returns Resolves when delete completes or the file is absent.
   */
  async deleteStack(stackId: string): Promise<void> {
    const rel = stackRelativeFilePath(stackId);
    try {
      await this.fileSystemService.deleteFile(rel);
    } catch {
      // missing file — no-op
    }
  }

  /**
   * Lists basenames in `data/.undo` (e.g. `foo_bar.json`).
   *
   * @returns Stack filenames, or an empty list on I/O failure.
   */
  async listStackFiles(): Promise<string[]> {
    try {
      return await this.fileSystemService.listFiles(UNDO_RELATIVE_DIR);
    } catch {
      return [];
    }
  }

  /**
   * Removes all persisted undo stack files under `data/.undo`.
   *
   * @returns Resolves when every listed file has been deleted or the directory is empty.
   */
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
