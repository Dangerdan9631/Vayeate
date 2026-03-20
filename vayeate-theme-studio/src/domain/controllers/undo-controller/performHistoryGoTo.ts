import { singleton } from 'tsyringe';
import { PerformHistoryGoTo } from '../../operations/undo-operations';

@singleton()
export class PerformHistoryGoToController {
  constructor(private readonly performHistoryGoTo: PerformHistoryGoTo) {}

  async run(frameId: string): Promise<void> {
    await this.performHistoryGoTo.execute(frameId);
  }
}
