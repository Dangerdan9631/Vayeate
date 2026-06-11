import { singleton } from 'tsyringe';
import { LogService } from '../../../gateway/services/log-service';

/**
 * Initializes log service during app startup.
 */

@singleton()
export class InitializeLogServiceOperation {
  constructor(private readonly logService: LogService) {}

  /**
   * Runs the initialize log service mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.logService.init();
  }
}
