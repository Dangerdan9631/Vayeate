import type { AppState } from '../../state/app-state';
import type { SetState } from '../app-operations';

export type { SetState };
export type GetState = () => AppState;
