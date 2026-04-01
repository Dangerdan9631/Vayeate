import { describe, it, expect } from 'vitest';
import { initialAppState } from './app-state';
import { windowStateReducer } from './window-state-reducer';

describe('windowStateReducer', () => {
  describe('SET_WINDOW_SIZE', () => {
    it('updates state.window.size and leaves other window fields unchanged', () => {
      const state = initialAppState;
      const update = { type: 'SET_WINDOW_SIZE' as const, size: { width: 800, height: 600 } };
      const next = windowStateReducer(state, update);

      expect(next.window.size).toEqual({ width: 800, height: 600 });
      expect(next.window.position).toBe(state.window.position);
      expect(next.window.loadState).toBe(state.window.loadState);
      expect(next.window.isMinimized).toBe(state.window.isMinimized);
      expect(next.window.isMaximized).toBe(state.window.isMaximized);
      expect(next.window.viewport).toBe(state.window.viewport);
    });
  });

  describe('SET_WINDOW_POSITION', () => {
    it('updates state.window.position and leaves other window fields unchanged', () => {
      const state = initialAppState;
      const update = { type: 'SET_WINDOW_POSITION' as const, position: { x: 100, y: 50 } };
      const next = windowStateReducer(state, update);

      expect(next.window.position).toEqual({ x: 100, y: 50 });
      expect(next.window.size).toBe(state.window.size);
      expect(next.window.loadState).toBe(state.window.loadState);
      expect(next.window.isMinimized).toBe(state.window.isMinimized);
      expect(next.window.isMaximized).toBe(state.window.isMaximized);
      expect(next.window.viewport).toBe(state.window.viewport);
    });
  });

  describe('SET_VIEWPORT_SIZE', () => {
    it('updates state.window.viewport and leaves other window fields unchanged', () => {
      const state = initialAppState;
      const update = { type: 'SET_VIEWPORT_SIZE' as const, size: { width: 1920, height: 1080 } };
      const next = windowStateReducer(state, update);

      expect(next.window.viewport).toEqual({ width: 1920, height: 1080 });
      expect(next.window.size).toBe(state.window.size);
      expect(next.window.position).toBe(state.window.position);
    });
  });
});
