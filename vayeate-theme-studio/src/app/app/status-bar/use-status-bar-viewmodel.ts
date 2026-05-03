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

export function useStatusBarViewModel(): StatusBarViewModel {
  const actionQueueStatus = useStore(actionQueueStore.api, (state) => state.state);
  const {
    queueLength: actionQueueLength,
  } = actionQueueStatus;
  const showActionQueueProgressArea = useMemo(() => actionQueueLength > 0, [actionQueueLength]);

  const actionQueueStatusText = useMemo(
    () => `${actionQueueLength} action${actionQueueLength !== 1 ? 's' : ''} in queue`,
    [actionQueueLength],
  );

  const mainQueueLength = useStore(backgroundQueueStore.api, (state) => state.state.mainQueueLength);
  const mainQueueDescription = useStore(backgroundQueueStore.api, (state) => state.state.mainQueueDescription);
  const workerQueueLength = useStore(backgroundQueueStore.api, (state) => state.state.workerQueueLength);
  const workerTaskDescriptions = useStore(backgroundQueueStore.api, (state) => state.state.workerTaskDescriptions);
  const showBackgroundProgressArea = useMemo(() => mainQueueLength > 0 || workerQueueLength > 0, [mainQueueLength, workerQueueLength]);

  const backgroundQueueStatusText = useMemo(
    () => {
      const total = mainQueueLength + workerQueueLength;
      const description = (mainQueueLength > 0)
        ? mainQueueDescription
        : workerTaskDescriptions.length > 0
          ? `${workerTaskDescriptions[0]} + (${workerTaskDescriptions.length} in parallel)`
          : "";
      
      return `${description} (${total} background task${total !== 1 ? 's' : ''} in queue)`;
    },
    [mainQueueLength, mainQueueDescription, workerQueueLength, workerTaskDescriptions],
  );

  const showStatusCluster = useMemo(() => showBackgroundProgressArea || showActionQueueProgressArea, [showBackgroundProgressArea, showActionQueueProgressArea]);

  return {
    showStatusCluster,
    showBackgroundProgressArea,
    backgroundQueueStatusText,
    showActionQueueProgressArea,
    actionQueueStatusText,
  };
}
