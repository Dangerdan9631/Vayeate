import { describe, expect, it } from 'vitest';
import { initialAppState } from '../../state/app-state';
import type { AppState } from '../../state/app-state';
import { canRestoreWindow } from './canRestoreWindow';

function getState(overrides: Partial<AppState['window']> = {}): () => AppState {
  const state: AppState = {
    ...initialAppState,
    window: { ...initialAppState.window, ...overrides },
  };
  return () => state;
}

describe('canRestoreWindow', () => {
  it('returns true when window is maximized', () => {
    expect(canRestoreWindow(getState({ isMaximized: true, isMinimized: false }))).toBe(true);
  });

  it('returns true when window is minimized', () => {
    expect(canRestoreWindow(getState({ isMaximized: false, isMinimized: true }))).toBe(true);
  });

  it('returns false when window is neither maximized nor minimized', () => {
    expect(canRestoreWindow(getState({ isMaximized: false, isMinimized: false }))).toBe(false);
  });
});
