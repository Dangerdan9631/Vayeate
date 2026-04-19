import { singleton } from 'tsyringe';
import { InitializeLogServiceOperation } from '../../../domain/operations/app-operations/initialize-log-service-operation';

@singleton()
export class BootstrapAppController {
  constructor(private readonly initializeLogService: InitializeLogServiceOperation) {}

  run(): void {
    this.initializeLogService.execute();
  }
}
