import { vi } from 'vitest';

/**
 * Preload-shaped stubs for LogService + window IPC (merge into tests that assign a custom `window.electronAPI`).
 */
export function electronPreloadStubs() {
  return {
    sendLog: vi.fn(),
    onMainLog: vi.fn(),
    onWindowState: vi.fn(() => () => {}),
    onWindowResize: vi.fn(() => () => {}),
    onWindowMove: vi.fn(() => () => {}),
  };
}
