import { singleton } from 'tsyringe';
import { BootstrapAppConfigOperation } from '../../operations/app-operations/bootstrap-app-config-operation';
import { InitializeLogServiceOperation } from '../../operations/app-operations/initialize-log-service-operation';

@singleton()
export class BootstrapAppController {
  constructor(
    private readonly bootstrapAppConfig: BootstrapAppConfigOperation,
    private readonly initializeLogService: InitializeLogServiceOperation,
  ) {}

  async run(): Promise<void> {
    this.initializeLogService.execute();
    this.bootstrapAppConfig.execute();
  }
}
