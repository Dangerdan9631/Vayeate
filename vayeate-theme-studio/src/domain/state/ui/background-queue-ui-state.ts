export interface BackgroundQueueUiState {
    queueLength: number;
    description: string | undefined;
}

export const initialBackgroundQueueUiState: BackgroundQueueUiState = {
    queueLength: 0,
    description: undefined
};
