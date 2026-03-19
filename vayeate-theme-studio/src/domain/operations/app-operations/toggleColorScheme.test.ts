import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { UiStateUpdate } from '../../state/ui-state-reducer';
import { toggleColorScheme } from '.';
import { configService } from '../../../gateway/services/config-service';

vi.mock('../../../gateway/services/config-service', () => ({
  configService: {
    save: vi.fn(),
  },
}));

describe('toggleColorScheme operation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles from dark (checked=true) to light and persists', async () => {
    const uiUpdates: UiStateUpdate[] = [];
    const calls: string[] = [];

    const setUiState = (update: UiStateUpdate) => {
      uiUpdates.push(update);
      calls.push('ui');
    };

    vi.mocked(configService.save).mockImplementation(async () => {
      calls.push('persist');
    });

    await toggleColorScheme(setUiState, true);

    expect(uiUpdates).toEqual([{ type: 'SET_UI_COLOR_SCHEME', scheme: 'light' }]);
    expect(configService.save).toHaveBeenCalledWith({ colorScheme: 'light' });
    expect(calls).toEqual(['ui', 'persist']);
  });

  it('toggles from light (checked=false) to dark and persists', async () => {
    const uiUpdates: UiStateUpdate[] = [];
    const calls: string[] = [];

    const setUiState = (update: UiStateUpdate) => {
      uiUpdates.push(update);
      calls.push('ui');
    };

    vi.mocked(configService.save).mockImplementation(async () => {
      calls.push('persist');
    });

    await toggleColorScheme(setUiState, false);

    expect(uiUpdates).toEqual([{ type: 'SET_UI_COLOR_SCHEME', scheme: 'dark' }]);
    expect(configService.save).toHaveBeenCalledWith({ colorScheme: 'dark' });
    expect(calls).toEqual(['ui', 'persist']);
  });
});

