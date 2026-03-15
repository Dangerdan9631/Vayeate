import type { AppStateUpdate } from '../../state/app-state';

export type SetState = (update: AppStateUpdate) => void;
