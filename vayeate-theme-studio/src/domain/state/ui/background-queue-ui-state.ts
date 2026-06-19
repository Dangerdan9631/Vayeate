/**
 * Observable length and pending action descriptions for one background queue.
 */
export interface QueueUiState {
    queueLength: number;
    queueDescriptions: string[];
}

/**
 * Named background queues keyed by queue identifier.
 */
export interface QueueMap {
    [key: string]: QueueUiState;
}

/**
 * Observable status for all background queues shown in the shell.
 */
export interface BackgroundQueueUiState {
    queues: QueueMap;
}

/**
 * Default background queue observability state for main, deferred, and data I/O queues.
 */
export const initialBackgroundQueueUiState: BackgroundQueueUiState = {
    queues: {
        main: {
            queueLength: 0,
            queueDescriptions: []
        },
        deferred: {
            queueLength: 0,
            queueDescriptions: []
        },
        data_io: {
            queueLength: 0,
            queueDescriptions: []
        }
    }
};
