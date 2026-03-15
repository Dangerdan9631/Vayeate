import { describe, expect, it } from 'vitest';
import { initialAppState } from '../../state/app-state';
import type { AppState } from '../../state/app-state';
import { canMinimizeWindow } from './canMinimizeWindow';

function getState(overrides: Partial<AppState['window']> = {}): () => AppState {
  const state: AppState = {
    ...initialAppState,
    window: { ...initialAppState.window, ...overrides },
  };
  return () => state;
}

describe('canMinimizeWindow', () => {
  it('returns true when window is not minimized', () => {
    expect(canMinimizeWindow(getState({ isMinimized: false }))).toBe(true);
  });

  it('returns false when window is already minimized', () => {
    expect(canMinimizeWindow(getState({ isMinimized: true }))).toBe(false);
  });
});
