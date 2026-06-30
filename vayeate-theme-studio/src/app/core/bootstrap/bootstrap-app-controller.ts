import { singleton } from 'tsyringe';
import { InitializeLogServiceOperation } from '../../../domain/operations/app-operations/initialize-log-service-operation';

/**
 * Runs one-time app initialization before the action queue is ready (e.g. logging).
 */
@singleton()
export class BootstrapAppController {
  constructor(private readonly initializeLogService: InitializeLogServiceOperation) {}

  run(): void {
    this.initializeLogService.execute();
  }
}
