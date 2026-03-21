import { describe, expect, it, vi, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import type { UiStateUpdate } from '../../state/ui-state-reducer';
import { UiStateSetter } from '../../state/ui-state-setter';
import { ToggleColorScheme } from '.';
import { ConfigService } from '../../../gateway/services/config-service';

const configMock = {
  save: vi.fn(),
};

describe('ToggleColorScheme operation', () => {
  beforeEach(() => {
    container.clearInstances();
    vi.clearAllMocks();
    container.registerInstance(ConfigService, configMock as unknown as ConfigService);
  });

  it('toggles from dark (checked=true) to light and persists', async () => {
    const uiUpdates: UiStateUpdate[] = [];
    const calls: string[] = [];

    const setUiState = (update: UiStateUpdate) => {
      uiUpdates.push(update);
      calls.push('ui');
    };

    vi.mocked(configMock.save).mockImplementation(async () => {
      calls.push('persist');
    });

    container.registerInstance(UiStateSetter, new UiStateSetter(setUiState));
    await container.resolve(ToggleColorScheme).execute(true);

    expect(uiUpdates).toEqual([{ type: 'SET_UI_COLOR_SCHEME', scheme: 'light' }]);
    expect(configMock.save).toHaveBeenCalledWith({ colorScheme: 'light' });
    expect(calls).toEqual(['ui', 'persist']);
  });

  it('toggles from light (checked=false) to dark and persists', async () => {
    const uiUpdates: UiStateUpdate[] = [];
    const calls: string[] = [];

    const setUiState = (update: UiStateUpdate) => {
      uiUpdates.push(update);
      calls.push('ui');
    };

    vi.mocked(configMock.save).mockImplementation(async () => {
      calls.push('persist');
    });

    container.registerInstance(UiStateSetter, new UiStateSetter(setUiState));
    await container.resolve(ToggleColorScheme).execute(false);

    expect(uiUpdates).toEqual([{ type: 'SET_UI_COLOR_SCHEME', scheme: 'dark' }]);
    expect(configMock.save).toHaveBeenCalledWith({ colorScheme: 'dark' });
    expect(calls).toEqual(['ui', 'persist']);
  });
});
