import type { WindowInitializationCallbacks } from './types';

export abstract class WindowCallbacksPort {
  abstract initialize(callbacks: WindowInitializationCallbacks): void;
  abstract dispose(): void;
}
