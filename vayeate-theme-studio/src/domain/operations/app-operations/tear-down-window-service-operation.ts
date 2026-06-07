import { singleton } from 'tsyringe';
import { WindowCallbacksPort } from './window-callbacks-port';

@singleton()
export class TearDownWindowServiceOperation {
  constructor(
    private readonly windowCallbacks: WindowCallbacksPort
  ) {}

  execute(): void {
    this.windowCallbacks.dispose();
  }
}
