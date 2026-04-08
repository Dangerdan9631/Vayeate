import { useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../../core/components/AppProvider';

export interface StatusBarViewModel {
  showProgressArea: boolean;
  queueStatusText: string;
}

function statusBarShowProgressArea(isProcessing: boolean, queueLength: number): boolean {
  return isProcessing || queueLength > 0;
}

function statusBarQueueStatusText(queueLength: number): string {
  const total = queueLength + 1;
  return `${total} action${queueLength !== 0 ? 's' : ''} in queue`;
}

export function useStatusBarViewModel(): StatusBarViewModel {
  const queueStatus = useContextSelector(AppContext, (c) => c?.state.ui.queueStatus);
  if (queueStatus === undefined) {
    throw new Error('useStatusBarViewModel must be used within AppProvider');
  }
  const { isProcessing, queueLength } = queueStatus;

  return useMemo(
    () => ({
      showProgressArea: statusBarShowProgressArea(isProcessing, queueLength),
      queueStatusText: statusBarQueueStatusText(queueLength),
    }),
    [isProcessing, queueLength],
  );
}
