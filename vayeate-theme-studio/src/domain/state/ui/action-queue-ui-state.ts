export interface ActionQueueUiState {
    isProcessing: boolean;
    queueLength: number;
    description: string | undefined;
}

export const initialActionQueueUiState: ActionQueueUiState = { isProcessing: false, queueLength: 0, description: undefined };
