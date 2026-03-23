import { singleton } from 'tsyringe';
import { InitializeLogService } from '../../operations/app-operations';

@singleton()
export class InitializeLoggingController {
  constructor(private readonly initializeLogService: InitializeLogService) { }
  run(): void {
    this.initializeLogService.execute();
  }
}