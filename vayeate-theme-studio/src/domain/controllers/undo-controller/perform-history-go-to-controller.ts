import { singleton } from 'tsyringe';
import { PerformHistoryGoToOperation } from '../../operations/undo-operations';

@singleton()
export class PerformHistoryGoToController {
  constructor(private readonly performHistoryGoTo: PerformHistoryGoToOperation) {}

  async run(frameId: string): Promise<void> {
    await this.performHistoryGoTo.execute(frameId);
  }
}
