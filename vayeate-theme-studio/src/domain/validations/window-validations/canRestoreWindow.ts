import type { WindowState } from '../../state/window/window-state';

export type GetWindowState = () => WindowState;

export function canRestoreWindow(getWindowState: GetWindowState): boolean {
  const { isMaximized, isMinimized } = getWindowState();
  return isMaximized || isMinimized;
}
