import { singleton } from 'tsyringe';
import { InitializeLogServiceOperation } from '../../operations/app-operations/initialize-log-service-operation';

@singleton()
export class InitializeLoggingController {
  constructor(private readonly initializeLogService: InitializeLogServiceOperation) { }
  async run(): Promise<void> {
    this.initializeLogService.execute();
  }
}