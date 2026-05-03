export interface BackgroundQueueUiState {
    mainQueueLength: number;
    mainQueueDescription: string | undefined;
    workerQueueLength: number;
    workerTaskDescriptions: string[];
}

export const initialBackgroundQueueUiState: BackgroundQueueUiState = {
    mainQueueLength: 0,
    mainQueueDescription: undefined,
    workerQueueLength: 0,
    workerTaskDescriptions: []
};
