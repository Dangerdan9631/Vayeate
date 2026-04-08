import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStyledTooltipViewModel } from './use-styled-tooltip-viewmodel';

describe('useStyledTooltipViewModel', () => {
  it('throws when used outside AppProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => {
        renderHook(() => useStyledTooltipViewModel());
      }).toThrow(/useStyledTooltipViewModel must be used within AppProvider/);
    } finally {
      consoleError.mockRestore();
    }
  });
});
