import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SaveAppConfig } from '../../operations/app-operations';
import type { SetColorScheme } from '../../operations/app-operations';
import { SetColorSchemeController } from './setColorScheme';

describe('SetColorSchemeController', () => {
  let setColorSchemeExecute: ReturnType<typeof vi.fn>;
  let saveAppConfigExecute: ReturnType<typeof vi.fn>;
  let controller: SetColorSchemeController;

  beforeEach(() => {
    setColorSchemeExecute = vi.fn();
    saveAppConfigExecute = vi.fn().mockResolvedValue(undefined);
    const setColorScheme = { execute: setColorSchemeExecute } as unknown as SetColorScheme;
    const saveAppConfig = { execute: saveAppConfigExecute } as unknown as SaveAppConfig;
    controller = new SetColorSchemeController(setColorScheme, saveAppConfig);
  });

  it('run sets color scheme then saves app config', async () => {
    await controller.run('light');
    expect(setColorSchemeExecute).toHaveBeenCalledTimes(1);
    expect(setColorSchemeExecute).toHaveBeenCalledWith('light');
    expect(saveAppConfigExecute).toHaveBeenCalledTimes(1);
    expect(saveAppConfigExecute).toHaveBeenCalledWith();
  });
});
