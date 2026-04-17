import { singleton } from 'tsyringe';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { AppConfigState, initialAppConfigState } from './app-config-state';
import type { ColorScheme } from '../../../model/schema/primitives';

interface AppConfigStoreState {
    config: AppConfigState;
    setConfig: (appConfig: AppConfigState) => void;
    setColorScheme: (colorScheme: ColorScheme) => void;
}

@singleton()
export class AppConfigStore {
    private store = createStore<AppConfigStoreState>()(
        immer((set): AppConfigStoreState => ({
            config: initialAppConfigState,
            setConfig: (appConfig: AppConfigState) => set((storeState: AppConfigStoreState) => {
                storeState.config = appConfig;
            }),
            setColorScheme: (colorScheme: ColorScheme) => set((storeState: AppConfigStoreState) => {
                storeState.config.colorScheme = colorScheme;
            })
        }))
    );
    
    get api() {
        return this.store;
    }

    getStore(): AppConfigStoreState {
        return this.store.getState();
    }
}
