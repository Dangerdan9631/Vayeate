import { useMemo } from 'react';
import { BackgroundQueueUiStore } from '../../../domain/state/ui/background-queue-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { ActionQueueUiStore } from '../../../domain/state/ui/action-queue-ui-store';
import type { QueueMap } from '../../../domain/state/ui/background-queue-ui-state';

/**
 * Resolved action queue UI store for foreground queue status.
 */
const actionQueueStore = container.resolve(ActionQueueUiStore);
/**
 * Resolved background queue UI store for deferred queue status.
 */
const backgroundQueueStore = container.resolve(BackgroundQueueUiStore);

/**
 * Derived queue progress fields exposed by the status bar viewmodel.
 */
export interface StatusBarViewModel {
  showProgressArea: boolean;
  queueStatusText: string;
  runningActionDescriptions: string[];
}

/**
 * Aggregates action and background queue observability for the status footer.
 * @returns Progress visibility, summary text, and running action descriptions.
 */
export function useStatusBarViewModel(): StatusBarViewModel {
  const actionQueueLength = useStore(actionQueueStore.api, (state) => state.state.queueLength);
  const currentActionDescription = useStore(
    actionQueueStore.api,
    (state) => state.state.currentActionDescription,
  );
  const backgroundQueues: QueueMap = useStore(
    backgroundQueueStore.api,
    useShallow((state) => state.state.queues),
  );

  const { actionText, runningActionDescriptions } = useMemo(
    () => {
      let actionText: string | undefined = undefined;
      const descriptions: string[] = [];

      if (actionQueueLength > 0 && currentActionDescription) {
        actionText = currentActionDescription;
        descriptions.push(`[Action] ${currentActionDescription}`);
      }

      for (const [queueName, queue] of Object.entries(backgroundQueues)) {
        if (queue.queueLength == 1 && !actionText) {
          actionText = queue.queueDescriptions[0];
        }

        queue.queueDescriptions
          .map((description) => `[${queueName}] ${description}`)
          .forEach((description) => descriptions.push(description));
      }

      return {
        actionText: descriptions.length === 1 ? actionText : undefined,
        runningActionDescriptions: descriptions,
      };
    },
    [actionQueueLength, currentActionDescription, backgroundQueues],
  );

  const queuedActionCount = useMemo(
    () => {
      const actionQueueQueuedCount = Math.max(actionQueueLength - (currentActionDescription ? 1 : 0), 0);
      const backgroundQueueQueuedCount = Object.values(backgroundQueues)
        .reduce((acc, queue) => acc + Math.max(queue.queueLength - queue.queueDescriptions.length, 0), 0);

      return actionQueueQueuedCount + backgroundQueueQueuedCount;
    },
    [actionQueueLength, currentActionDescription, backgroundQueues],
  );

  const queueStatusText = useMemo(
    () => {
      const runningActionCount = runningActionDescriptions.length;
      const executingText = actionText ?? `${runningActionCount} action${runningActionCount !== 1 ? 's' : ''} executing`;

      return queuedActionCount > 0
        ? `${executingText}, ${queuedActionCount} queued`
        : executingText;
    },
    [queuedActionCount, actionText, runningActionDescriptions.length],
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
