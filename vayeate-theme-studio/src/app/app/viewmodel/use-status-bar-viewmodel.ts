import { useMemo } from 'react';
import { BackgroundQueueStore } from '../../../domain/state/ui/background-queue-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { ActionQueueStore } from '../../../domain/state/ui/action-queue-store';

const actionQueueStore = container.resolve(ActionQueueStore);
const backgroundQueueStore = container.resolve(BackgroundQueueStore);

export interface StatusBarViewModel {
  showStatusCluster: boolean;
  showBackgroundProgressArea: boolean;
  backgroundQueueStatusText: string;
  showActionQueueProgressArea: boolean;
  actionQueueStatusText: string;
}

function statusBarShowProgressArea(isProcessing: boolean, queueLength: number): boolean {
  return isProcessing || queueLength > 0;
}

function statusBarActionQueueStatusText(queueLength: number, description: string | undefined): string {
  const total = queueLength;
  return (description)
    ? `${description} (${total} action${queueLength !== 0 ? 's' : ''} in queue)`
    : `${total + 1} action${queueLength !== 0 ? 's' : ''} in queue`;
}

function statusBarBackgroundQueueStatusText(queueLength: number, description: string | undefined): string {
  const total = queueLength;
  return (description)
    ? `${description} (${total} background task${queueLength !== 0 ? 's' : ''} in queue)`
    : `${total + 1} background task${queueLength !== 0 ? 's' : ''} in queue`;
}

export function useStatusBarViewModel(): StatusBarViewModel {
  const actionQueueStatus = useStore(actionQueueStore.api, (state) => state.state);
  const {
    isProcessing: actionProcessing,
    queueLength: actionQueueLength,
    description: actionQueueDescription,
  } = actionQueueStatus;
  
  const backgroundQueueStatus = useStore(backgroundQueueStore.api, (state) => state.state);
  const {
    isProcessing: backgroundProcessing,
    queueLength: backgroundQueueLength,
    description: backgroundQueueDescription,
  } = backgroundQueueStatus;

  const showBackgroundProgressArea = statusBarShowProgressArea(backgroundProcessing, backgroundQueueLength);
  const showActionQueueProgressArea = statusBarShowProgressArea(actionProcessing, actionQueueLength);

  return useMemo(
    () => ({
      showStatusCluster: showBackgroundProgressArea || showActionQueueProgressArea,
      showBackgroundProgressArea,
      backgroundQueueStatusText: statusBarBackgroundQueueStatusText(backgroundQueueLength, backgroundQueueDescription),
      showActionQueueProgressArea,
      actionQueueStatusText: statusBarActionQueueStatusText(actionQueueLength, actionQueueDescription),
    }),
    [
      showBackgroundProgressArea,
      showActionQueueProgressArea,
      backgroundQueueLength,
      actionQueueLength,
    ],
  );
}
