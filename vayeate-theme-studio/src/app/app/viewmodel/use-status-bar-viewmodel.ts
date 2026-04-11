import { useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../../core/app-context';

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
  const total = queueLength + 1;
  return `${total} action${queueLength !== 0 ? 's' : ''} in queue`;
}

function statusBarBackgroundQueueStatusText(queueLength: number): string {
  const total = queueLength + 1;
  return `${total} background task${queueLength !== 0 ? 's' : ''} in queue`;
}

export function useStatusBarViewModel(): StatusBarViewModel {
  const queueStatus = useContextSelector(AppContext, (c) => c?.state.ui.queueStatus);
  const backgroundQueueStatus = useContextSelector(AppContext, (c) => c?.state.ui.backgroundQueueStatus);
  if (queueStatus === undefined || backgroundQueueStatus === undefined) {
    throw new Error('useStatusBarViewModel must be used within AppProvider');
  }
  const { isProcessing: actionProcessing, queueLength: actionQueueLength } = queueStatus;
  const { isProcessing: backgroundProcessing, queueLength: backgroundQueueLength } = backgroundQueueStatus;

  const showBackgroundProgressArea = statusBarShowProgressArea(backgroundProcessing, backgroundQueueLength);
  const showActionQueueProgressArea = statusBarShowProgressArea(actionProcessing, actionQueueLength);

  return useMemo(
    () => ({
      showStatusCluster: showBackgroundProgressArea || showActionQueueProgressArea,
      showBackgroundProgressArea,
      backgroundQueueStatusText: statusBarBackgroundQueueStatusText(backgroundQueueLength),
      showActionQueueProgressArea,
      actionQueueStatusText: statusBarActionQueueStatusText(actionQueueLength),
    }),
    [
      showBackgroundProgressArea,
      showActionQueueProgressArea,
      backgroundQueueLength,
      actionQueueLength,
    ],
  );
}
