import {
  closeWindow as closeWindowOp,
  maximizeWindow as maximizeWindowOp,
  restoreWindow as restoreWindowOp,
  minimizeWindow as minimizeWindowOp,
  dragWindow as dragWindowOp,
  reloadWindow as reloadWindowOp,
  toggleDevTools as toggleDevToolsOp,
} from '../operations/window-operations';

export async function closeWindow(): Promise<void> {
  await closeWindowOp();
}

export async function maximizeWindow(): Promise<void> {
  await maximizeWindowOp();
}

export async function restoreWindow(): Promise<void> {
  await restoreWindowOp();
}

export async function minimizeWindow(): Promise<void> {
  await minimizeWindowOp();
}

export async function dragWindow(): Promise<void> {
  await dragWindowOp();
}

export async function reloadWindow(): Promise<void> {
  await reloadWindowOp(false);
}

export async function forceReloadWindow(): Promise<void> {
  await reloadWindowOp(true);
}

export async function toggleDevTools(): Promise<void> {
  await toggleDevToolsOp();
}
