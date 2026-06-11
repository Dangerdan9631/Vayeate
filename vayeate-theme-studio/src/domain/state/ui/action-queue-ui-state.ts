/**
 * Observable status for the UI action queue shown in the shell.
 */
export interface ActionQueueUiState {
    queueLength: number;
    currentActionDescription: string | undefined;
}

/**
 * Default action queue observability state when no actions are queued.
 */
export const initialActionQueueUiState: ActionQueueUiState = {
    queueLength: 0,
    currentActionDescription: undefined
};
