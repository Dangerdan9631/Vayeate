import { singleton } from 'tsyringe';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { AppConfigState, initialAppConfigState } from './app-config-state';
import { ColorScheme } from '../../../model/schema';

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
            setConfig: (appConfig: AppConfigState) => set((state: AppConfigStoreState) => {
                state.config = appConfig;
            }),
            setColorScheme: (colorScheme: ColorScheme) => set((state: AppConfigStoreState) => {
                state.config.colorScheme = colorScheme;
            })
        }))
    );
    
    get api() {
        return this.store;
    }

    getState(): AppConfigStoreState {
        return this.store.getState();
    }
}