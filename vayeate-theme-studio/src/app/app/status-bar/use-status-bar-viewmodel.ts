import { useMemo } from 'react';
import { BackgroundQueueUiStore } from '../../../domain/state/ui/background-queue-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { ActionQueueUiStore } from '../../../domain/state/ui/action-queue-ui-store';

const actionQueueStore = container.resolve(ActionQueueUiStore);
const backgroundQueueStore = container.resolve(BackgroundQueueUiStore);

export interface StatusBarViewModel {
  showProgressArea: boolean;
  queueStatusText: string;
  runningActionDescriptions: string[];
}

export function useStatusBarViewModel(): StatusBarViewModel {
  const actionQueueStatus = useStore(actionQueueStore.api, (state) => state.state);
  const {
    queueLength: actionQueueLength,
    currentActionDescription,
  } = actionQueueStatus;

  const mainQueueLength = useStore(backgroundQueueStore.api, (state) => state.state.mainQueueLength);
  const mainQueueDescription = useStore(backgroundQueueStore.api, (state) => state.state.mainQueueDescription);
  const workerQueueLength = useStore(backgroundQueueStore.api, (state) => state.state.workerQueueLength);
  const workerTaskDescriptions = useStore(backgroundQueueStore.api, (state) => state.state.workerTaskDescriptions);

  const runningActionDescriptions = useMemo(
    () => {
      const descriptions: string[] = [];

      if (actionQueueLength > 0 && currentActionDescription) {
        descriptions.push(currentActionDescription);
      }

      if (mainQueueLength > 0 && mainQueueDescription) {
        descriptions.push(mainQueueDescription);
      }

      descriptions.push(...workerTaskDescriptions);

      return descriptions;
    },
    [actionQueueLength, currentActionDescription, mainQueueLength, mainQueueDescription, workerTaskDescriptions],
  );

  const queuedActionCount = useMemo(
    () => {
      const actionQueueQueuedCount = Math.max(actionQueueLength - (currentActionDescription ? 1 : 0), 0);
      const mainQueueQueuedCount = Math.max(mainQueueLength - (mainQueueDescription ? 1 : 0), 0);
      const workerQueueQueuedCount = Math.max(workerQueueLength - workerTaskDescriptions.length, 0);

      return actionQueueQueuedCount + mainQueueQueuedCount + workerQueueQueuedCount;
    },
    [actionQueueLength, currentActionDescription, mainQueueLength, mainQueueDescription, workerQueueLength, workerTaskDescriptions.length],
  );

  const queueStatusText = useMemo(
    () => {
      const runningActionCount = runningActionDescriptions.length;
      const executingText = `${runningActionCount} action${runningActionCount !== 1 ? 's' : ''} executing`;

      return queuedActionCount > 0
        ? `${executingText}, ${queuedActionCount} queued`
        : executingText;
    },
    [queuedActionCount, runningActionDescriptions.length],
  );

  const showProgressArea = useMemo(
    () => runningActionDescriptions.length > 0 || queuedActionCount > 0,
    [queuedActionCount, runningActionDescriptions.length],
  );

  return {
    showProgressArea,
    queueStatusText,
    runningActionDescriptions,
  };
}
