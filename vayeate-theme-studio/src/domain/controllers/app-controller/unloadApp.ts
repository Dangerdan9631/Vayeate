import { singleton } from 'tsyringe';
import {
  TearDownWindowService,
} from '../../operations/app-operations';

@singleton()
export class UnloadAppController {
  constructor(
    private readonly tearDownWindowService: TearDownWindowService,
  ) { }
  run(): void {
    this.tearDownWindowService.execute();
    // TODO: Uncomment this when undo is implemented
    // void this.clearPersistedUndo.execute();
  }
}
