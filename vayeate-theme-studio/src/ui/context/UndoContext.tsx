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
import { createUndoStack, type UndoFrame, type UndoStackState } from '../../utils/undo-stack';
import type { CatalogsState, TemplatesState, ThemesState } from '../../state/app-state';
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
}

function themePaneStateFromThemesState(t: ThemesState): ThemePaneState {
  return {
    theme: t.theme,
    checkedColorRefs: t.checkedColorRefs,
    checkedContrastRefs: t.checkedContrastRefs,
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
      { theme: null, checkedColorRefs: [], checkedContrastRefs: [] },
      MAX_FRAMES,
    ),
  );
  const templateStackRef = useRef(
    createUndoStack<TemplatePaneState>({ template: null }, MAX_FRAMES),
  );
  const catalogStackRef = useRef(
    createUndoStack<CatalogPaneState>({ catalog: null }, MAX_FRAMES),
  );

  const lastThemeIdRef = useRef<string>(docIdTheme(themesState.selectedRef));
  const lastTemplateIdRef = useRef<string>(docIdTemplate(templatesState.selectedRef));
  const lastCatalogIdRef = useRef<string>(docIdCatalog(catalogsState.selectedRef));

  useEffect(() => {
    const themeId = docIdTheme(themesState.selectedRef);
    const paneState = themePaneStateFromThemesState(themesState);
    const stack = themeStackRef.current;
    const currentBase = stack.base as ThemePaneState;
    const stackState = stack.getState();

    if (themeId !== lastThemeIdRef.current) {
      lastThemeIdRef.current = themeId;
      stack.clearAndSetBase(paneState);
      setVersion((v) => v + 1);
    } else if (
      themeId &&
      paneState.theme &&
      paneState.checkedColorRefs.length > 0 &&
      currentBase.checkedColorRefs.length === 0 &&
      stackState.frames.length === 0
    ) {
      // Base was set when theme loaded before selections were applied (race); fix before any edits
      stack.setBase(paneState);
      setVersion((v) => v + 1);
    }
  }, [docIdTheme(themesState.selectedRef), themesState]);

  useEffect(() => {
    const templateId = docIdTemplate(templatesState.selectedRef);
    if (templateId !== lastTemplateIdRef.current) {
      lastTemplateIdRef.current = templateId;
      templateStackRef.current.clearAndSetBase({ template: templatesState.template });
      setVersion((v) => v + 1);
    }
  }, [docIdTemplate(templatesState.selectedRef), templatesState.template]);

  useEffect(() => {
    const catalogId = docIdCatalog(catalogsState.selectedRef);
    if (catalogId !== lastCatalogIdRef.current) {
      lastCatalogIdRef.current = catalogId;
      catalogStackRef.current.clearAndSetBase({ catalog: catalogsState.catalog });
      setVersion((v) => v + 1);
    }
  }, [docIdCatalog(catalogsState.selectedRef), catalogsState.catalog]);

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
    },
    [],
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
      const state = stack.undo();
      if (state !== null) {
        const s = state as ThemePaneState;
        dispatch({
          type: 'RESTORE_THEME_STATE',
          theme: s.theme ?? undefined,
          checkedColorRefs: s.checkedColorRefs,
          checkedContrastRefs: s.checkedContrastRefs,
        } as AppAction);
        setVersion((v) => v + 1);
      }
    } else if (activeTab === 'templates') {
      const stack = templateStackRef.current;
      const state = stack.undo();
      if (state !== null) {
        dispatch({
          type: 'RESTORE_TEMPLATE_STATE',
          template: (state as TemplatePaneState).template,
        });
        setVersion((v) => v + 1);
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
        } as AppAction);
        setVersion((v) => v + 1);
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
      }
    }
  }, [activeTab, dispatch]);

  const goTo = useCallback(
    (pane: PaneId, index: number) => {
      if (pane === 'themes') {
        const stack = themeStackRef.current;
        const state = stack.goTo(index);
        if (state !== null) {
          const s = state as ThemePaneState;
          dispatch({
            type: 'RESTORE_THEME_STATE',
            theme: s.theme ?? undefined,
            checkedColorRefs: s.checkedColorRefs,
            checkedContrastRefs: s.checkedContrastRefs,
          } as AppAction);
          setVersion((v) => v + 1);
        }
      } else if (pane === 'templates') {
        const stack = templateStackRef.current;
        const state = stack.goTo(index);
        if (state !== null) {
          dispatch({
            type: 'RESTORE_TEMPLATE_STATE',
            template: (state as TemplatePaneState).template,
          });
          setVersion((v) => v + 1);
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
