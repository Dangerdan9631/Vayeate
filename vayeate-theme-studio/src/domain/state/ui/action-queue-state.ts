export interface ActionQueueState {
    isProcessing: boolean;
    queueLength: number;
    description: string | undefined;
}

export const initialActionQueueState: ActionQueueState = { isProcessing: false, queueLength: 0, description: undefined };
