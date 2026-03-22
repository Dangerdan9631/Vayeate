import { singleton } from 'tsyringe';
import { LogService } from '../../../gateway/services/log-service';

@singleton()
export class InitializeLogService {
  constructor(private readonly logService: LogService) {}

  execute(): void {
    this.logService.init();
  }
}
