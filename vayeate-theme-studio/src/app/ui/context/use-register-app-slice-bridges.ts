import type { MutableRefObject } from 'react';
import type { AppState } from '../../../domain/state/app-state';
import {
  CatalogsStateGetter,
  CatalogsStateSetter,
  catalogsStateReducer,
} from '../../../domain/state/catalog/catalogs-state-reducer';
import {
  TemplatesStateGetter,
  TemplatesStateSetter,
  templatesStateReducer,
} from '../../../domain/state/template/templates-state-reducer';
import {
  ThemesStateGetter,
  ThemesStateSetter,
  themesStateReducer,
} from '../../../domain/state/theme/themes-state-reducer';
import {
  AppConfigStateGetter,
  AppConfigStateSetter,
  appConfigStateReducer,
} from '../../../domain/state/app-config/app-config-state-reducer';
import {
  UndoStackStateGetter,
  UndoStackStateSetter,
  undoStackStateReducer,
} from '../../../domain/state/undo-stack/undo-stack-state-reducer';
import {
  UiStateGetter,
  UiStateSetter,
  uiStateReducer,
} from '../../../domain/state/ui/ui-state-reducer';
import {
  QueueStatusStateGetter,
  QueueStatusStateSetter,
  queueStatusStateReducer,
} from '../../../domain/state/ui/queue-status-state-reducer';
import {
  WindowStateGetter,
  WindowStateSetter,
  windowStateReducer,
} from '../../../domain/state/window/window-state-reducer';
import { useAppSliceBridge } from './use-app-slice-bridge';

export interface RegisterAppSliceBridgesParams {
  stateRef: MutableRefObject<AppState>;
  replaceState: (next: AppState) => void;
  getState: () => AppState;
}

export function useRegisterAppSliceBridges({
  stateRef,
  replaceState,
  getState,
}: RegisterAppSliceBridgesParams): void {
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: catalogsStateReducer,
    selectSlice: (s: AppState) => s.catalogs,
    SetterClass: CatalogsStateSetter,
    GetterClass: CatalogsStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: templatesStateReducer,
    selectSlice: (s: AppState) => s.templates,
    SetterClass: TemplatesStateSetter,
    GetterClass: TemplatesStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: themesStateReducer,
    selectSlice: (s: AppState) => s.themes,
    SetterClass: ThemesStateSetter,
    GetterClass: ThemesStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: appConfigStateReducer,
    selectSlice: (s: AppState) => s.appConfig,
    SetterClass: AppConfigStateSetter,
    GetterClass: AppConfigStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: undoStackStateReducer,
    selectSlice: (s: AppState) => s.undoStack,
    SetterClass: UndoStackStateSetter,
    GetterClass: UndoStackStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: uiStateReducer,
    selectSlice: (s: AppState) => s.ui,
    SetterClass: UiStateSetter,
    GetterClass: UiStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: (appState, queueStatus) =>
      queueStatusStateReducer(appState, { type: 'SET_QUEUE_STATUS', queueStatus }),
    selectSlice: (s: AppState) => s.ui.queueStatus,
    SetterClass: QueueStatusStateSetter,
    GetterClass: QueueStatusStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: windowStateReducer,
    selectSlice: (s: AppState) => s.window,
    SetterClass: WindowStateSetter,
    GetterClass: WindowStateGetter,
  });
}
