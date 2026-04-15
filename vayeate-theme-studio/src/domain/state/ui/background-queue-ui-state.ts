export interface BackgroundQueueUiState {
    isProcessing: boolean;
    queueLength: number;
    description: string | undefined;
}

export const initialBackgroundQueueUiState: BackgroundQueueUiState = { isProcessing: false, queueLength: 0, description: undefined };
