import { useMemo } from 'react';
import { BackgroundQueueUiStore } from '../../../domain/state/ui/background-queue-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { ActionQueueUiStore } from '../../../domain/state/ui/action-queue-ui-store';

const actionQueueStore = container.resolve(ActionQueueUiStore);
const backgroundQueueStore = container.resolve(BackgroundQueueUiStore);

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

function statusBarActionQueueStatusText(queueLength: number): string {
  const total = queueLength;
  return `${total} action${queueLength !== 1 ? 's' : ''} in queue`;
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
    queueLength: actionQueueLength,
  } = actionQueueStatus;
  const actionProcessing = actionQueueLength > 0;

  const backgroundQueueStatus = useStore(backgroundQueueStore.api, (state) => state.state);
  const {
    queueLength: backgroundQueueLength,
    description: backgroundQueueDescription,
  } = backgroundQueueStatus;
  const backgroundProcessing = backgroundQueueDescription !== undefined;

  const showBackgroundProgressArea = statusBarShowProgressArea(backgroundProcessing, backgroundQueueLength);
  const showActionQueueProgressArea = statusBarShowProgressArea(actionProcessing, actionQueueLength);

  return useMemo(
    () => ({
      showStatusCluster: showBackgroundProgressArea || showActionQueueProgressArea,
      showBackgroundProgressArea,
      backgroundQueueStatusText: statusBarBackgroundQueueStatusText(backgroundQueueLength, backgroundQueueDescription),
      showActionQueueProgressArea,
      actionQueueStatusText: statusBarActionQueueStatusText(actionQueueLength),
    }),
    [
      showBackgroundProgressArea,
      showActionQueueProgressArea,
      backgroundQueueLength,
      backgroundQueueDescription,
      actionQueueLength,
    ],
  );
}
