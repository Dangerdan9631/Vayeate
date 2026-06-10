import { describe, expect, it, vi } from 'vitest';
import { themeSchema } from '../../../model/schema/theme-schemas';
import { ApplyThemeUndoStateOperation } from './apply-theme-undo-state-operation';

describe('apply theme undo state operation', () => {
  it('sets theme state and schedules persist for the snapshot', () => {
    const theme = themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [],
      contrastAssignments: [],
    });
    const setTheme = { execute: vi.fn() };
    const applyThemeStateAndSchedulePersist = { execute: vi.fn() };

    new ApplyThemeUndoStateOperation(
      setTheme as never,
      applyThemeStateAndSchedulePersist as never,
    ).execute(theme);

    expect(setTheme.execute).toHaveBeenCalledWith(theme);
    expect(applyThemeStateAndSchedulePersist.execute).toHaveBeenCalledWith(theme);
  });
});
