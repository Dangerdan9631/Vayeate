import { singleton } from 'tsyringe';
import type { AppConfig } from '../../model/schema/primitives';
import { FileSystemService } from '../services/file-system-service';

/** Package-relative path: Theme Studio root `data/config.json`. */
const CONFIG_RELATIVE_FILE = 'data/config.json';

const DEFAULT_CONFIG: AppConfig = { colorScheme: 'dark' };

function parseAppConfig(raw: string | null): AppConfig {
  if (raw === null || raw.trim() === '') {
    return DEFAULT_CONFIG;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && parsed !== null && 'colorScheme' in parsed) {
      const cs = (parsed as { colorScheme?: unknown }).colorScheme;
      if (cs === 'light') {
        return { colorScheme: 'light' };
      }
    }
  } catch {
    // malformed file — same fallback as preload (`electron/preload.ts`)
  }
  return DEFAULT_CONFIG;
}

@singleton()
export class ConfigGateway {
  constructor(private readonly fileSystemService: FileSystemService) {}

  /** Read `data/config.json`; missing or invalid file yields `{ colorScheme: 'dark' }` (matches startup preload). */
  async load(): Promise<AppConfig> {
    const raw = await this.fileSystemService.loadFile(CONFIG_RELATIVE_FILE);
    return parseAppConfig(raw);
  }

  async save(config: AppConfig): Promise<void> {
    await this.fileSystemService.saveFile(CONFIG_RELATIVE_FILE, JSON.stringify(config, null, 2));
  }
}
