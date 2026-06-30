import type { WindowInitializationCallbacks } from './types';

/**
 * Abstraction for window callbacks consumed by domain operations.
 */

export abstract class WindowCallbacksPort {

  /**
   * Runs initialize for window callbacks.
   * @param callbacks Callbacks (WindowInitializationCallbacks).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */
  abstract initialize(callbacks: WindowInitializationCallbacks): void;

  /**
   * Runs dispose for window callbacks.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */
  abstract dispose(): void;
}
