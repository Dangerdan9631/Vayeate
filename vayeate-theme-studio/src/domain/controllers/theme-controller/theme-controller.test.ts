import { vi } from 'vitest';
import { initialAppState } from '../../state/app-state';
import { themeSchema } from '../../../model/schemas';
import { createThemeWithParams } from '../../../model/factories';
import {
  SetPreviewVariableSelectionController,
  SetPreviewVariableFilterTextController,
  ClearPreviewVariableFilterController,
  SetPreviewSelectedSampleController,
  PreviewSampleButtonScrollController,
  LoadThemePageController,
  CommitHueReferenceColorController,
  HandleMemberSwatchRightClickController,
} from '.';

describe('createThemeWithParams', () => {
  it('returns an object that satisfies theme schema', () => {
    const theme = createThemeWithParams({ name: 'test' });
    const result = themeSchema.safeParse(theme);
    expect(result.success).toBe(true);
  });

  it('returns theme with the given name and defaults', () => {
    const theme = createThemeWithParams({ name: 'my-theme' });
    expect(theme.name).toBe('my-theme');
    expect(theme.version).toBe('1.0.0');
    expect(theme.templateRef).toBeNull();
    expect(theme.idePrimaryTokenRef).toBeNull();
    expect(theme.themeBackgroundTokenRef).toBeNull();
    expect(theme.colorAssignments).toEqual([]);
    expect(theme.contrastAssignments).toEqual([]);
  });
});

describe('THEME_PREVIEW_* controller', () => {
  const setThemePaneSelections = { execute: vi.fn() };
  const setThemePreviewVariableFilterText = { execute: vi.fn() };
  const setThemePreviewVariableFilterClear = { execute: vi.fn() };
  const setThemePreviewSelectedSampleKey = { execute: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SetPreviewVariableSelectionController sets color ref when value is in colorAssignments', () => {
    const themeWithTemplate = {
      ...createThemeWithParams({ name: 't' }),
      templateRef: { name: 'tp', version: '1.0.0' },
      colorAssignments: [{ colorRef: 'primary', dark: { value: '#111' }, light: null, useDarkForLight: false }],
      contrastAssignments: [],
    };
    const appStateGetter = {
      current: vi.fn(() => ({
        ...initialAppState,
        themes: { ...initialAppState.themes, theme: themeWithTemplate },
      })),
    };
    const controller = new SetPreviewVariableSelectionController(
      appStateGetter as any,
      setThemePaneSelections as any,
    );
    controller.run('primary');
    expect(setThemePaneSelections.execute).toHaveBeenCalledWith(['primary'], []);
  });

  it('SetPreviewVariableSelectionController sets contrast ref when value is in contrastAssignments', () => {
    const themeWithTemplate = {
      ...createThemeWithParams({ name: 't' }),
      templateRef: { name: 'tp', version: '1.0.0' },
      colorAssignments: [],
      contrastAssignments: [
        { contrastVariableRef: 'textContrast', dark: { value: 4.5, comparisonMethod: 'greaterThan' as const, min: null, max: null }, light: null, useDarkForLight: false },
      ],
    };
    const appStateGetter = {
      current: vi.fn(() => ({
        ...initialAppState,
        themes: { ...initialAppState.themes, theme: themeWithTemplate },
      })),
    };
    const controller = new SetPreviewVariableSelectionController(
      appStateGetter as any,
      setThemePaneSelections as any,
    );
    controller.run('textContrast');
    expect(setThemePaneSelections.execute).toHaveBeenCalledWith([], ['textContrast']);
  });

  it('SetPreviewVariableSelectionController does nothing when theme has no templateRef', () => {
    const appStateGetter = {
      current: vi.fn(() => ({
        ...initialAppState,
        themes: { ...initialAppState.themes, theme: createThemeWithParams({ name: 't' }) },
      })),
    };
    const controller = new SetPreviewVariableSelectionController(
      appStateGetter as any,
      setThemePaneSelections as any,
    );
    controller.run('primary');
    expect(setThemePaneSelections.execute).not.toHaveBeenCalled();
  });

  it('SetPreviewVariableFilterTextController dispatches SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', () => {
    const controller = new SetPreviewVariableFilterTextController(
      setThemePreviewVariableFilterText as any,
    );
    controller.run('filter');
    expect(setThemePreviewVariableFilterText.execute).toHaveBeenCalledWith('filter');
  });

  it('ClearPreviewVariableFilterController dispatches filter text empty', () => {
    const controller = new ClearPreviewVariableFilterController(
      setThemePreviewVariableFilterClear as any,
    );
    controller.run();
    expect(setThemePreviewVariableFilterClear.execute).toHaveBeenCalledTimes(1);
  });

  it('SetPreviewSelectedSampleController dispatches SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', () => {
    const controller = new SetPreviewSelectedSampleController(
      setThemePreviewSelectedSampleKey as any,
    );
    controller.run('sample-key');
    expect(setThemePreviewSelectedSampleKey.execute).toHaveBeenCalledWith('sample-key');
  });

  it('PreviewSampleButtonScrollController is a no-op', () => {
    const controller = new PreviewSampleButtonScrollController();
    controller.run();
  });
});

describe('theme routing wrapper controllers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('LoadThemePageController composes LoadThemeRefsController then resets current undo stack id', async () => {
    const loadRefsMock = { run: vi.fn().mockResolvedValue(undefined) };
    const setUndoMock = { execute: vi.fn() };

    const controller = new LoadThemePageController(loadRefsMock as any, setUndoMock as any);

    await controller.run();

    expect(loadRefsMock.run).toHaveBeenCalledTimes(1);
    expect(setUndoMock.execute).toHaveBeenCalledWith(null);
    expect(loadRefsMock.run.mock.invocationCallOrder[0]).toBeLessThan(
      setUndoMock.execute.mock.invocationCallOrder[0],
    );
  });

  it('CommitHueReferenceColorController composes hue reference update and hue reset', () => {
    const setHueReference = { execute: vi.fn() };
    const setHueAdjustment = { execute: vi.fn() };

    const controller = new CommitHueReferenceColorController(
      setHueReference as any,
      setHueAdjustment as any,
    );
    controller.run('#112233');

    expect(setHueReference.execute).toHaveBeenCalledWith('#112233');
    expect(setHueAdjustment.execute).toHaveBeenCalledWith(0);
  });

  it('HandleMemberSwatchRightClickController is a no-op controller', () => {
    expect(() => new HandleMemberSwatchRightClickController().run('x')).not.toThrow();
  });
});
