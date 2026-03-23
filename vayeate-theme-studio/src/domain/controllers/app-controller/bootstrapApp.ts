import { singleton } from 'tsyringe';
import { InitializeWindowService, TearDownWindowService } from '../../operations/app-operations';



@singleton()
export class BootstrapAppController {
  constructor(
    private readonly initializeWindowService: InitializeWindowService,
    private readonly tearDownWindowService: TearDownWindowService,
  ) { }
  
  run(): (() => void) {
    this.initializeWindowService.execute();
    return () => {
      this.tearDownWindowService.execute();
    }
  }
}
