import { describe, expect, it } from 'vitest';
import { initialAppState } from '../../state/app-state';
import type { AppState } from '../../state/app-state';
import { canMaximizeWindow } from './canMaximizeWindow';

function getState(overrides: Partial<AppState['window']> = {}): () => AppState {
  const state: AppState = {
    ...initialAppState,
    window: { ...initialAppState.window, ...overrides },
  };
  return () => state;
}

describe('canMaximizeWindow', () => {
  it('returns true when window is not maximized', () => {
    expect(canMaximizeWindow(getState({ isMaximized: false }))).toBe(true);
  });

  it('returns false when window is already maximized', () => {
    expect(canMaximizeWindow(getState({ isMaximized: true }))).toBe(false);
  });
});
