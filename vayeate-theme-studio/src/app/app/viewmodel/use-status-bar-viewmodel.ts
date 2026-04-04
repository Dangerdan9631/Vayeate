import { useMemo } from 'react';
import { useAppState } from '../../common/context/use-app-state';

export interface StatusBarViewModel {
  showProgressArea: boolean;
  queueStatusText: string;
}

export function statusBarShowProgressArea(isProcessing: boolean, queueLength: number): boolean {
  return isProcessing || queueLength > 0;
}

export function statusBarQueueStatusText(queueLength: number): string {
  const total = queueLength + 1;
  return `${total} action${queueLength !== 0 ? 's' : ''} in queue`;
}

export function useStatusBarViewModel(): StatusBarViewModel {
  const { state } = useAppState();
  const { isProcessing, queueLength } = state.ui.queueStatus;

  return useMemo(
    () => ({
      showProgressArea: statusBarShowProgressArea(isProcessing, queueLength),
      queueStatusText: statusBarQueueStatusText(queueLength),
    }),
    [isProcessing, queueLength],
  );
}
