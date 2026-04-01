import { singleton } from 'tsyringe';
import {
  TearDownWindowServiceOperation,
} from '../../operations/app-operations';

@singleton()
export class UnloadAppController {
  constructor(
    private readonly tearDownWindowService: TearDownWindowServiceOperation,
  ) { }
  run(): void {
    this.tearDownWindowService.execute();
    // TODO: Uncomment this when undo is implemented
    // void this.clearPersistedUndo.execute();
  }
}
