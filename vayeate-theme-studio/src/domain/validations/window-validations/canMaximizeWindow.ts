import type { WindowState } from '../../state/window/window-state';

export type GetWindowState = () => WindowState;

export function canMaximizeWindow(getWindowState: GetWindowState): boolean {
  return !getWindowState().isMaximized;
}
