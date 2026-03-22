import { singleton } from 'tsyringe';
import { FileSystemService } from '../services/file-system-service';

/** Package-relative path: Theme Studio root `data/config.json`. */
const CONFIG_RELATIVE_FILE = 'data/config.json';

@singleton()
export class ConfigGateway {
  constructor(private readonly fileSystemService: FileSystemService) {}

  async save(config: { colorScheme: 'light' | 'dark' }): Promise<void> {
    await this.fileSystemService.saveFile(CONFIG_RELATIVE_FILE, JSON.stringify(config, null, 2));
  }
}
