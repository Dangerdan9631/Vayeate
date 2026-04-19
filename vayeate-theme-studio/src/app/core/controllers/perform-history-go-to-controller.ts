import { singleton } from 'tsyringe';
import { PerformHistoryGoToOperation } from '../../../domain/operations/undo-operations/perform-history-go-to-operation';

@singleton()
export class PerformHistoryGoToController {
  constructor(private readonly performHistoryGoTo: PerformHistoryGoToOperation) {}

  run(frameId: string): void {
    this.performHistoryGoTo.execute(frameId);
  }
}
