import { singleton } from 'tsyringe';
import { InitializeLogServiceOperation } from '../../operations/app-operations';

@singleton()
export class InitializeLoggingController {
  constructor(private readonly initializeLogService: InitializeLogServiceOperation) { }
  run(): void {
    this.initializeLogService.execute();
  }
}