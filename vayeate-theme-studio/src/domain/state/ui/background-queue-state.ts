export interface BackgroundQueueState {
    isProcessing: boolean;
    queueLength: number;
    description: string | undefined;
}

export const initialBackgroundQueueState: BackgroundQueueState = { isProcessing: false, queueLength: 0, description: undefined };
