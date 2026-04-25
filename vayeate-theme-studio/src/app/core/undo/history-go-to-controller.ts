import { singleton } from 'tsyringe';
import { HistoryGoToOperation } from '../../../domain/operations/undo-operations/history-go-to-operation';

@singleton()
export class HistoryGoToController {
  constructor(private readonly performHistoryGoTo: HistoryGoToOperation) {}

  run(frameId: string): void {
    this.performHistoryGoTo.execute(frameId);
  }
}
