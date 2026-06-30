import 'reflect-metadata';
import '@testing-library/jest-dom';

// Shared baseline test setup stays intentionally small: framework polyfills only.
class TestResizeObserver implements ResizeObserver {
  readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}
}

globalThis.ResizeObserver ??= TestResizeObserver;
