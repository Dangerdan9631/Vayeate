export interface QueueUiState {
    queueLength: number;
    queueDescriptions: string[];
}

export interface QueueMap {
    [key: string]: QueueUiState;
}

export interface BackgroundQueueUiState {
    queues: QueueMap;
}

export const initialBackgroundQueueUiState: BackgroundQueueUiState = {
    queues: {
        main: {
            queueLength: 0,
            queueDescriptions: []
        },
        worker: {
            queueLength: 0,
            queueDescriptions: []
        }
    }
};
