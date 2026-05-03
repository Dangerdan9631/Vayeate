import { useStore } from 'zustand';
import { WindowStore } from '../../../domain/state/ui/window-store';
import { container } from 'tsyringe';

const windowStore = container.resolve(WindowStore);

export interface StyledTooltipViewModel {
  viewport: { width: number; height: number };
}

export function useStyledTooltipViewModel(): StyledTooltipViewModel {
  const viewport = useStore(windowStore.api, (state) => state.state.viewport);
  if (viewport === undefined) {
    throw new Error('useStyledTooltipViewModel must be used within AppProvider');
  }
  return { viewport };
}
