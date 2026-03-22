import { describe, it, expect } from 'vitest';
import { mapWindowStateEventToUpdate } from './mapWindowStateEventToUpdate';

describe('mapWindowStateEventToUpdate', () => {
  it.each([
    ['minimized' as const, { type: 'SET_WINDOW_MINIMIZED' as const, value: true }],
    ['maximized' as const, { type: 'SET_WINDOW_MAXIMIZED' as const, value: true }],
    ['unmaximized' as const, { type: 'SET_WINDOW_MAXIMIZED' as const, value: false }],
    ['restored' as const, { type: 'SET_WINDOW_MINIMIZED' as const, value: false }],
  ])('maps %s', (event, expected) => {
    expect(mapWindowStateEventToUpdate(event)).toEqual(expected);
  });
});
