import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toggleColorScheme } from '.';
import { toggleColorScheme as toggleColorSchemeOp } from '../../operations/app-operations';

vi.mock('../../operations/app-operations', () => ({
  toggleColorScheme: vi.fn(),
}));

describe('app-controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toggleColorScheme operation with setUiState and checked', async () => {
    const setUiState = vi.fn();
    const checked = true;

    vi.mocked(toggleColorSchemeOp).mockResolvedValue(undefined);

    await toggleColorScheme(setUiState, checked);

    expect(toggleColorSchemeOp).toHaveBeenCalledTimes(1);
    expect(toggleColorSchemeOp).toHaveBeenCalledWith(setUiState, checked);
  });
});

