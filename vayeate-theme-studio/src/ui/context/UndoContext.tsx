import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import type { AppAction } from '../../actions/action-types';
import type { Catalog, Template, Theme } from '../../model/schemas';
import {
  createUndoStack,
  createFromSerializedState,
  type SerializedUndoState,
  type UndoFrame,
  type UndoStackState,
} from '../../utils/undo-stack';
import type { CatalogsState, TemplatesState, ThemesState } from '../../state/app-state';
import { undoStackService, type UndoPane } from '../../services/undo-stack-service';
import {
  useActiveTab,
  useAppDispatch,
  useCatalogsState,
  useTemplatesState,
  useThemesState,
} from './slice-contexts';
import type { TabId } from '../tabs';

const MAX_FRAMES = 50;

export interface ThemePaneState {
  theme: Theme | null;
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
  hueAdjustment: number;
  hueReferenceHex: string;
}

function themePaneStateFromThemesState(t: ThemesState): ThemePaneState {
  return {
    theme: t.theme,
    checkedColorRefs: t.checkedColorRefs,
    checkedContrastRefs: t.checkedContrastRefs,
    hueAdjustment: t.hueAdjustment ?? 0,
    hueReferenceHex: t.hueReferenceHex ?? '#FF0000',
  };
}

interface TemplatePaneState {
  template: Template | null;
}

export interface CatalogPaneState {
  catalog: Catalog | null;
  undoMetadata?: { deleteVersionOnRestore?: { name: string; version: string } };
}

function docIdTheme(ref: ThemesState['selectedRef']): string {
  return ref ? `${ref.name}@${ref.version}` : '';
}
function docIdTemplate(ref: TemplatesState['selectedRef']): string {
  return ref ? `${ref.name}@${ref.version}` : '';
}
function docIdCatalog(ref: CatalogsState['selectedRef']): string {
  return ref ? `${ref.name}@${ref.version}` : '';
}

export type PaneId = TabId;

export interface UndoStackValue {
  push: (pane: PaneId, label: string, prev: unknown, next: unknown) => void;
  undo: () => void;
  redo: () => void;
  goTo: (pane: PaneId, index: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  frames: UndoFrame[];
  currentIndex: number;
  activePane: PaneId;
}

const UndoContext = createContext<UndoStackValue | null>(null);

export function useUndoStack(): UndoStackValue {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error('useUndoStack must be used within UndoProvider');
  return ctx;
}

export type CatalogUndoPush = (label: string, prev: CatalogPaneState, next: CatalogPaneState) => void;

export function UndoProvider({
  children,
  catalogUndoPushRef,
}: {
  children: ReactNode;
  catalogUndoPushRef?: MutableRefObject<CatalogUndoPush | null>;
}) {
  const dispatch = useAppDispatch();
  const activeTab = useActiveTab();
  const themesState = useThemesState();
  const templatesState = useTemplatesState();
  const catalogsState = useCatalogsState();

  const [version, setVersion] = useState(0);

  const themeStackRef = useRef(
    createUndoStack<ThemePaneState>(
      { theme: null, checkedColorRefs: [], checkedContrastRefs: [], hueAdjustment: 0, hueReferenceHex: '#FF0000' },
      MAX_FRAMES,
    ),
  );
  const templateStackRef = useRef(
    createUndoStack<TemplatePaneState>({ template: null }, MAX_FRAMES),
  );
  const catalogStackRef = useRef(
    createUndoStack<CatalogPaneState>({ catalog: null }, MAX_FRAMES),
  );

  function getDocIdForPane(pane: PaneId): string {
    if (pane === 'themes') return docIdTheme(themesState.selectedRef);
    if (pane === 'templates') return docIdTemplate(templatesState.selectedRef);
    return docIdCatalog(catalogsState.selectedRef);
  }

  const lastContextRef = useRef<{ pane: PaneId; docId: string } | undefined>(undefined);
  const latestContextRef = useRef<{ pane: PaneId; docId: string }>({ pane: activeTab, docId: getDocIdForPane(activeTab) });
  latestContextRef.current = { pane: activeTab, docId: getDocIdForPane(activeTab) };

  useEffect(() => {
    const current: { pane: PaneId; docId: string } = {
      pane: activeTab,
      docId: getDocIdForPane(activeTab),
    };
    const previous = lastContextRef.current;
    const loadingFor = current;

    const run = async (): Promise<{ raw: string | null } | null> => {
      if (previous !== undefined && previous.pane === current.pane && previous.docId === current.docId) {
        return null;
      }
      if (previous !== undefined && previous.docId) {
        const stack =
          previous.pane === 'themes'
            ? themeStackRef.current
            : previous.pane === 'templates'
              ? templateStackRef.current
              : catalogStackRef.current;
        const serialized = (stack as { getSerializableState(): SerializedUndoState<object> }).getSerializableState();
        await undoStackService.save(previous.pane as UndoPane, previous.docId, JSON.stringify(serialized));
      }

      const raw = await undoStackService.load(current.pane as UndoPane, current.docId);
      return { raw };
    };

    let cancelled = false;
    run().then((result) => {
      if (cancelled || result === null) return;
      const now = latestContextRef.current;
      if (now.pane !== loadingFor.pane || now.docId !== loadingFor.docId) return;

      const { raw } = result;
      if (raw !== null) {
        try {
          const parsed = JSON.parse(raw) as SerializedUndoState<object>;
          if (loadingFor.pane === 'themes') {
            themeStackRef.current = createFromSerializedState(
              parsed as SerializedUndoState<ThemePaneState>,
              MAX_FRAMES,
            );
          } else if (loadingFor.pane === 'templates') {
            templateStackRef.current = createFromSerializedState(
              parsed as SerializedUndoState<TemplatePaneState>,
              MAX_FRAMES,
            );
          } else {
            catalogStackRef.current = createFromSerializedState(
              parsed as SerializedUndoState<CatalogPaneState>,
              MAX_FRAMES,
            );
          }
        } catch {
          // Invalid JSON: apply fresh stack below
        }
      }
      if (raw === null) {
        if (loadingFor.pane === 'themes') {
          const paneState = themePaneStateFromThemesState(themesState);
          themeStackRef.current = createUndoStack<ThemePaneState>(paneState, MAX_FRAMES);
        } else if (loadingFor.pane === 'templates') {
          templateStackRef.current = createUndoStack<TemplatePaneState>(
            { template: templatesState.template },
            MAX_FRAMES,
          );
        } else {
          catalogStackRef.current = createUndoStack<CatalogPaneState>(
            { catalog: catalogsState.catalog },
            MAX_FRAMES,
          );
        }
      }

      lastContextRef.current = loadingFor;
      setVersion((v) => v + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    docIdTheme(themesState.selectedRef),
    docIdTemplate(templatesState.selectedRef),
    docIdCatalog(catalogsState.selectedRef),
    themesState,
    templatesState.template,
    catalogsState.catalog,
  ]);

  function persistStackForPane(pane: PaneId): void {
    const docId = getDocIdForPane(pane);
    if (!docId) return;
    const stack =
      pane === 'themes'
        ? themeStackRef.current
        : pane === 'templates'
          ? templateStackRef.current
          : catalogStackRef.current;
    const serialized = (stack as { getSerializableState(): SerializedUndoState<object> }).getSerializableState();
    void undoStackService.save(pane as UndoPane, docId, JSON.stringify(serialized));
  }

  const push = useCallback(
    (pane: PaneId, label: string, prev: unknown, next: unknown) => {
      if (pane === 'themes') {
        themeStackRef.current.push(label, prev as ThemePaneState, next as ThemePaneState);
      } else if (pane === 'templates') {
        templateStackRef.current.push(label, prev as TemplatePaneState, next as TemplatePaneState);
      } else if (pane === 'catalogs') {
        catalogStackRef.current.push(label, prev as CatalogPaneState, next as CatalogPaneState);
      }
      setVersion((v) => v + 1);
      persistStackForPane(pane);
    },
    [themesState.selectedRef, templatesState.selectedRef, catalogsState.selectedRef],
  );

  useEffect(() => {
    if (!catalogUndoPushRef) return;
    catalogUndoPushRef.current = (label: string, prev: CatalogPaneState, next: CatalogPaneState) => {
      push('catalogs', label, prev, next);
    };
    return () => {
      catalogUndoPushRef.current = null;
    };
  }, [catalogUndoPushRef, push]);

  const undo = useCallback(() => {
    if (activeTab === 'themes') {
      const stack = themeStackRef.current;
      const stackState = stack.getState();
      const currentState = stack.stateAt(stackState.currentIndex) as ThemePaneState;
      const state = stack.undo();
      if (state !== null) {
        const s = state as ThemePaneState;
        const deleteThemeVersionOnRestore =
          currentState.theme && s.theme && currentState.theme.version !== s.theme.version
            ? { name: currentState.theme.name, version: currentState.theme.version }
            : undefined;
        dispatch({
          type: 'RESTORE_THEME_STATE',
          theme: s.theme ?? undefined,
          checkedColorRefs: s.checkedColorRefs,
          checkedContrastRefs: s.checkedContrastRefs,
          hueAdjustment: s.hueAdjustment,
          hueReferenceHex: s.hueReferenceHex,
          deleteThemeVersionOnRestore,
        } as AppAction);
        setVersion((v) => v + 1);
        persistStackForPane('themes');
      }
    } else if (activeTab === 'templates') {
      const stack = templateStackRef.current;
      const stackState = stack.getState();
      const currentState = stack.stateAt(stackState.currentIndex) as TemplatePaneState;
      const state = stack.undo();
      if (state !== null) {
        const s = state as TemplatePaneState;
        const deleteTemplateVersionOnRestore =
          currentState.template && s.template && currentState.template.version !== s.template.version
            ? { name: currentState.template.name, version: currentState.template.version }
            : undefined;
        dispatch({
          type: 'RESTORE_TEMPLATE_STATE',
          template: s.template,
          deleteTemplateVersionOnRestore,
        } as AppAction);
        setVersion((v) => v + 1);
        persistStackForPane('templates');
      }
    } else if (activeTab === 'catalogs') {
      const stack = catalogStackRef.current;
      const state = stack.undo();
      if (state !== null) {
        const s = state as CatalogPaneState;
        dispatch({
          type: 'RESTORE_CATALOG_STATE',
          catalog: s.catalog,
          deleteVersionOnRestore: s.undoMetadata?.deleteVersionOnRestore,
        } as AppAction);
        setVersion((v) => v + 1);
        persistStackForPane('catalogs');
      }
    }
  }, [activeTab, dispatch]);

  const redo = useCallback(() => {
    if (activeTab === 'themes') {
      const stack = themeStackRef.current;
      const state = stack.redo();
      if (state !== null) {
        const s = state as ThemePaneState;
        dispatch({
          type: 'RESTORE_THEME_STATE',
          theme: s.theme ?? undefined,
          checkedColorRefs: s.checkedColorRefs,
          checkedContrastRefs: s.checkedContrastRefs,
          hueAdjustment: s.hueAdjustment,
          hueReferenceHex: s.hueReferenceHex,
        } as AppAction);
        setVersion((v) => v + 1);
        persistStackForPane('themes');
      }
    } else if (activeTab === 'templates') {
      const stack = templateStackRef.current;
      const state = stack.redo();
      if (state !== null) {
        dispatch({
          type: 'RESTORE_TEMPLATE_STATE',
          template: (state as TemplatePaneState).template,
        });
        setVersion((v) => v + 1);
        persistStackForPane('templates');
      }
    } else if (activeTab === 'catalogs') {
      const stack = catalogStackRef.current;
      const state = stack.redo();
      if (state !== null) {
        const s = state as CatalogPaneState;
        dispatch({
          type: 'RESTORE_CATALOG_STATE',
          catalog: s.catalog,
          deleteVersionOnRestore: s.undoMetadata?.deleteVersionOnRestore,
        } as AppAction);
        setVersion((v) => v + 1);
        persistStackForPane('catalogs');
      }
    }
  }, [activeTab, dispatch]);

  const goTo = useCallback(
    (pane: PaneId, index: number) => {
      if (pane === 'themes') {
        const stack = themeStackRef.current;
        const stackState = stack.getState();
        const currentState = stack.stateAt(stackState.currentIndex) as ThemePaneState;
        const state = stack.goTo(index);
        if (state !== null) {
          const s = state as ThemePaneState;
          const deleteThemeVersionOnRestore =
            index < stackState.currentIndex &&
            currentState.theme &&
            s.theme &&
            currentState.theme.version !== s.theme.version
              ? { name: currentState.theme.name, version: currentState.theme.version }
              : undefined;
          dispatch({
            type: 'RESTORE_THEME_STATE',
            theme: s.theme ?? undefined,
            checkedColorRefs: s.checkedColorRefs,
            checkedContrastRefs: s.checkedContrastRefs,
            hueAdjustment: s.hueAdjustment,
            hueReferenceHex: s.hueReferenceHex,
            deleteThemeVersionOnRestore,
          } as AppAction);
          setVersion((v) => v + 1);
          persistStackForPane('themes');
        }
      } else if (pane === 'templates') {
        const stack = templateStackRef.current;
        const stackState = stack.getState();
        const currentState = stack.stateAt(stackState.currentIndex) as TemplatePaneState;
        const state = stack.goTo(index);
        if (state !== null) {
          const s = state as TemplatePaneState;
          const deleteTemplateVersionOnRestore =
            index < stackState.currentIndex &&
            currentState.template &&
            s.template &&
            currentState.template.version !== s.template.version
              ? { name: currentState.template.name, version: currentState.template.version }
              : undefined;
          dispatch({
            type: 'RESTORE_TEMPLATE_STATE',
            template: s.template,
            deleteTemplateVersionOnRestore,
          } as AppAction);
          setVersion((v) => v + 1);
          persistStackForPane('templates');
        }
      } else if (pane === 'catalogs') {
        const stack = catalogStackRef.current;
        const state = stack.goTo(index);
        if (state !== null) {
          const s = state as CatalogPaneState;
          dispatch({
            type: 'RESTORE_CATALOG_STATE',
            catalog: s.catalog,
            deleteVersionOnRestore: s.undoMetadata?.deleteVersionOnRestore,
          } as AppAction);
          setVersion((v) => v + 1);
          persistStackForPane('catalogs');
        }
      }
    },
    [dispatch],
  );

  const stackState = useMemo((): UndoStackState => {
    void version;
    if (activeTab === 'themes') return themeStackRef.current.getState();
    if (activeTab === 'templates') return templateStackRef.current.getState();
    return catalogStackRef.current.getState();
  }, [activeTab, version]);

  const value = useMemo<UndoStackValue>(
    () => ({
      push,
      undo,
      redo,
      goTo,
      canUndo: stackState.canUndo,
      canRedo: stackState.canRedo,
      frames: stackState.frames,
      currentIndex: stackState.currentIndex,
      activePane: activeTab,
    }),
    [
      push,
      undo,
      redo,
      goTo,
      stackState.canUndo,
      stackState.canRedo,
      stackState.frames,
      stackState.currentIndex,
      activeTab,
    ],
  );

  return <UndoContext.Provider value={value}>{children}</UndoContext.Provider>;
}
