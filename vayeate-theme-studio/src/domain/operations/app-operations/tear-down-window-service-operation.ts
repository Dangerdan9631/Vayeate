import { singleton } from 'tsyringe';
import { WindowCallbacksPort } from './window-callbacks-port';

/**
 * Applies the tear down window service domain change through store updates and optional I/O.
 */

@singleton()
export class TearDownWindowServiceOperation {
  constructor(
    private readonly windowCallbacks: WindowCallbacksPort
  ) {}

  /**
   * Runs the tear down window service mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.windowCallbacks.dispose();
  }
}
