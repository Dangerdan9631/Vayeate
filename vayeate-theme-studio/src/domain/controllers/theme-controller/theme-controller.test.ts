import { vi } from 'vitest';
import { initialAppState } from '../../state/app-state';
import { themeSchema } from '../../../model/schemas';
import { createThemeWithParams } from '../../../model/factories';
import {
  setPreviewVariableSelection,
  setPreviewVariableFilterText,
  clearPreviewVariableFilter,
  setPreviewSelectedSample,
  previewSampleButtonScroll,
  loadThemePage,
  commitHueReferenceColor,
  handleMemberSwatchRightClick,
} from '.';
import * as themeListController from './theme-list/loadThemeRefs';
import * as hueController from './palette-hue/setThemeHueReferenceHex';
import * as hueAdjustmentController from './palette-hue/setThemeHueAdjustment';
import * as undoOperations from '../../operations/undo-operations';

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
  const setState = vi.fn();
  const getState = vi.fn(() => ({ ...initialAppState }));

  beforeEach(() => {
    setState.mockClear();
    getState.mockClear();
  });

  it('setPreviewVariableSelection sets color ref when value is in colorAssignments', () => {
    const themeWithTemplate = {
      ...createThemeWithParams({ name: 't' }),
      templateRef: { name: 'tp', version: '1.0.0' },
      colorAssignments: [{ colorRef: 'primary', dark: { value: '#111' }, light: null, useDarkForLight: false }],
      contrastAssignments: [],
    };
    getState.mockReturnValue({
      ...initialAppState,
      themes: { ...initialAppState.themes, theme: themeWithTemplate },
    });
    setPreviewVariableSelection(setState, getState, 'primary');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_THEME_PANE_SELECTIONS',
      checkedColorRefs: ['primary'],
      checkedContrastRefs: [],
    });
  });

  it('setPreviewVariableSelection sets contrast ref when value is in contrastAssignments', () => {
    const themeWithTemplate = {
      ...createThemeWithParams({ name: 't' }),
      templateRef: { name: 'tp', version: '1.0.0' },
      colorAssignments: [],
      contrastAssignments: [
        { contrastVariableRef: 'textContrast', dark: { value: 4.5, comparisonMethod: 'greaterThan' as const, min: null, max: null }, light: null, useDarkForLight: false },
      ],
    };
    getState.mockReturnValue({
      ...initialAppState,
      themes: { ...initialAppState.themes, theme: themeWithTemplate },
    });
    setPreviewVariableSelection(setState, getState, 'textContrast');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_THEME_PANE_SELECTIONS',
      checkedColorRefs: [],
      checkedContrastRefs: ['textContrast'],
    });
  });

  it('setPreviewVariableSelection does nothing when theme has no templateRef', () => {
    getState.mockReturnValue({
      ...initialAppState,
      themes: { ...initialAppState.themes, theme: createThemeWithParams({ name: 't' }) },
    });
    setPreviewVariableSelection(setState, getState, 'primary');
    expect(setState).not.toHaveBeenCalled();
  });

  it('setPreviewVariableFilterText dispatches SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', () => {
    setPreviewVariableFilterText(setState, 'filter');
    expect(setState).toHaveBeenCalledWith({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value: 'filter' });
  });

  it('clearPreviewVariableFilter dispatches filter text empty', () => {
    clearPreviewVariableFilter(setState);
    expect(setState).toHaveBeenCalledWith({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value: '' });
  });

  it('setPreviewSelectedSample dispatches SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', () => {
    setPreviewSelectedSample(setState, 'sample-key');
    expect(setState).toHaveBeenCalledWith({ type: 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', value: 'sample-key' });
  });

  it('previewSampleButtonScroll is a no-op', () => {
    previewSampleButtonScroll(setState);
    expect(setState).not.toHaveBeenCalled();
  });
});

describe('theme routing wrapper controllers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loadThemePage composes loadThemeRefs then resets current undo stack id', async () => {
    const setState = vi.fn();
    const setStoreState = vi.fn();
    const loadRefsSpy = vi
      .spyOn(themeListController, 'loadThemeRefs')
      .mockResolvedValue(undefined);
    const setUndoSpy = vi
      .spyOn(undoOperations, 'setCurrentUndoStackId')
      .mockImplementation(() => {});

    await loadThemePage(setState, setStoreState);

    expect(loadRefsSpy).toHaveBeenCalledWith(setState, setStoreState);
    expect(setUndoSpy).toHaveBeenCalledWith(setState, null);
    expect(loadRefsSpy.mock.invocationCallOrder[0]).toBeLessThan(
      setUndoSpy.mock.invocationCallOrder[0],
    );
  });

  it('commitHueReferenceColor composes hue reference update and hue reset', () => {
    const setState = vi.fn();
    const setHueReferenceSpy = vi
      .spyOn(hueController, 'setThemeHueReferenceHex')
      .mockImplementation(() => {});
    const setHueAdjustmentSpy = vi
      .spyOn(hueAdjustmentController, 'setThemeHueAdjustment')
      .mockImplementation(() => {});

    commitHueReferenceColor(setState, '#112233');

    expect(setHueReferenceSpy).toHaveBeenCalledWith(setState, '#112233');
    expect(setHueAdjustmentSpy).toHaveBeenCalledWith(setState, 0);
  });

  it('handleMemberSwatchRightClick is a no-op controller', () => {
    expect(() => handleMemberSwatchRightClick(vi.fn(), vi.fn() as unknown as () => never, 'x')).not.toThrow();
  });
});
