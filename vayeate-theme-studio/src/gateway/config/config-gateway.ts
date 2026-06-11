import { singleton } from 'tsyringe';
import { appConfigSchema, type AppConfig } from '../../model/schema/primitives';
import { FileSystemService } from '../services/file-system-service';

/**
 * Package-relative path: Theme Studio root `data/config.json`.
 */
const CONFIG_RELATIVE_FILE = 'data/config.json';

/**
 * Fallback config when `data/config.json` is missing or invalid.
 */
const DEFAULT_CONFIG: AppConfig = { colorScheme: 'dark' };

/**
 * Parses stored config JSON into a validated `AppConfig`, or returns defaults.
 *
 * @param raw - File contents, or null when the file is absent.
 * @returns Validated config or `DEFAULT_CONFIG`.
 */
function parseAppConfig(raw: string | null): AppConfig {
  if (raw === null || raw.trim() === '') {
    return DEFAULT_CONFIG;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = appConfigSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch {
    // malformed file — same fallback as preload (`electron/preload.ts`)
  }
  return DEFAULT_CONFIG;
}

/**
 * Reads and writes `data/config.json` with startup-aligned defaults on read errors.
 */
@singleton()
export class ConfigGateway {
  constructor(private readonly fileSystemService: FileSystemService) {}

  /**
   * Reads `data/config.json`; missing or invalid file yields `{ colorScheme: 'dark' }`.
   *
   * @returns Validated application config.
   */
  async load(): Promise<AppConfig> {
    const raw = await this.fileSystemService.loadFile(CONFIG_RELATIVE_FILE);
    return parseAppConfig(raw);
  }

  /**
   * Serializes and saves application config to `data/config.json`.
   *
   * @param config - Config values to persist.
   * @returns Resolves when the file is written.
   */
  async save(config: AppConfig): Promise<void> {
    await this.fileSystemService.saveFile(CONFIG_RELATIVE_FILE, JSON.stringify(config, null, 2));
  }
}
