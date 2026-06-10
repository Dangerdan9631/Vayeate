import { describe, expect, it, vi } from 'vitest';
import { LoadAppConfigOperation } from './operations/app-operations/load-app-config-operation';
import { SaveAppConfigOperation } from './operations/app-operations/save-app-config-operation';
import { LoadUndoHistoryOperation } from './operations/undo-operations/load-undo-history-operation';
import { LoadAppController } from '../app/app/app-shell/controllers/load-app-controller';
import { undoManagerV2 } from './core/undo-manager-v2';
import { UNDO_BASELINE_FRAME_ID } from '../model/undo-history';
import { emptyUndoMenuSnapshot } from './state/undo-stack/undo-stack-state';
import { buildScopeColorMap, resolveColorForThemeTokenKey, resolveTokenColor } from './utils/scope-resolver';
import { computeDisplayColorAssignments } from './utils/compute-display-color-assignments';

describe('session and preview baselines', () => {
  it('loads and saves app config through queued operations', async () => {
    const setConfig = vi.fn();
    const store = {
      config: { colorScheme: 'dark' },
      setConfig,
    };
    const executeBackground = vi.fn(
      async (_queueType: string, _description: string, work: () => Promise<void> | void) => {
        await work();
        return { continue: vi.fn() };
      },
    );
    const configGateway = {
      load: vi.fn(async () => ({ colorScheme: 'light' })),
      save: vi.fn(),
    };

    new LoadAppConfigOperation(
      configGateway as never,
      { execute: executeBackground } as never,
      { getStore: () => store } as never,
    ).execute();

    await vi.waitFor(() => {
      expect(configGateway.load).toHaveBeenCalledTimes(1);
      expect(setConfig).toHaveBeenCalledWith({ colorScheme: 'light' });
    });

    new SaveAppConfigOperation(
      { getStore: () => store } as never,
      configGateway as never,
      { execute: executeBackground } as never,
    ).execute();

    await vi.waitFor(() => {
      expect(configGateway.save).toHaveBeenCalledWith({ colorScheme: 'dark' });
    });
  });

  it('hydrates undo history snapshots and handles empty stack selection', async () => {
    const setUndoMenuSnapshot = vi.fn();
    const undoStore = {
      getStore: () => ({
        state: { currentUndoStackId: null, currentBaselineLabel: 'Opened' },
        setUndoMenuSnapshot,
      }),
    };

    await new LoadUndoHistoryOperation(undoStore as never).execute();
    expect(setUndoMenuSnapshot).toHaveBeenCalledWith(emptyUndoMenuSnapshot);

    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockResolvedValue({
      list: () => ({
        frames: [{ id: 'frame-1', description: 'Changed color' }],
        currentId: 'frame-1',
      }),
      canUndo: true,
      canRedo: false,
    } as never);

    const setSnapshot = vi.fn();
    const populatedStore = {
      getStore: () => ({
        state: { currentUndoStackId: 'theme:baseline', currentBaselineLabel: 'Opened' },
        setUndoMenuSnapshot: setSnapshot,
        setUndoListVersion: vi.fn(),
      }),
    };

    await new LoadUndoHistoryOperation(populatedStore as never).execute();
    expect(getOrCreateSpy).toHaveBeenCalledWith('theme:baseline', expect.any(Object));
    expect(setSnapshot).toHaveBeenCalledWith({
      activeContextKey: 'theme:baseline',
      frames: [
        { id: 'frame-1', description: 'Changed color' },
        { id: UNDO_BASELINE_FRAME_ID, description: 'Opened' },
      ],
      recentActions: [{ id: 'frame-1', description: 'Changed color' }],
      currentId: 'frame-1',
      baselineLabel: 'Opened',
      canUndo: true,
      canRedo: false,
      nextUndoDescription: null,
      nextRedoDescription: null,
      historyVersion: 1,
    });

    getOrCreateSpy.mockRestore();
  });

  it('loads app startup undo history only after clearing prior-session files', () => {
    const order: string[] = [];
    const clearPersistedUndo = {
      execute: vi.fn(() => ({
        then: vi.fn((_label: string, onCleared: () => void) => {
          order.push('clear');
          onCleared();
        }),
      })),
    };
    const loadUndoHistory = {
      execute: vi.fn(() => {
        order.push('load-undo');
      }),
    };
    const controller = new LoadAppController(
      { run: vi.fn(() => order.push('window')) } as never,
      { execute: vi.fn(() => order.push('config')) } as never,
      clearPersistedUndo as never,
      loadUndoHistory as never,
    );

    controller.run();

    expect(clearPersistedUndo.execute).toHaveBeenCalledTimes(1);
    expect(loadUndoHistory.execute).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['window', 'clear', 'load-undo', 'config']);
  });

  it('resolves preview colors and display assignments from theme/template state', () => {
    const theme = {
      colorAssignments: [
        {
          colorRef: 'editorFg',
          dark: { value: '#112233' },
          light: { value: '#ddeeff' },
          useDarkForLight: false,
        },
      ],
    };
    const mappings = [
      {
        token: { key: 'keyword.control', type: 'textmate token' as const },
        colorVariableRef: 'editorFg',
        contrastVariableRef: null,
        groupRef: null,
      },
      {
        token: { key: 'editor.foreground', type: 'theme' as const },
        colorVariableRef: 'editorFg',
        contrastVariableRef: null,
        groupRef: null,
      },
    ];

    const scopeMap = buildScopeColorMap(mappings, theme.colorAssignments);
    expect(resolveTokenColor(['keyword.control.ts'], scopeMap, 'dark')).toBe('#112233');
    expect(
      resolveColorForThemeTokenKey(
        'editor.foreground',
        mappings,
        theme.colorAssignments,
        [],
        [],
        'light',
        '#ffffff',
      ),
    ).toBe('#ddeeff');

    const display = computeDisplayColorAssignments(
      {
        colorAssignments: theme.colorAssignments,
      } as never,
      0,
      new Set<string>(['editorFg']),
      true,
      true,
    );
    expect(display).toEqual(theme.colorAssignments);
  });
});
