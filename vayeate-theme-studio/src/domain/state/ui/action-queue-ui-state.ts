export interface ActionQueueUiState {
    queueLength: number;
    currentActionDescription: string | undefined;
}

export const initialActionQueueUiState: ActionQueueUiState = {
    queueLength: 0,
    currentActionDescription: undefined
};
