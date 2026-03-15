import { windowService } from '../../gateway/services/window-service';

export async function closeWindow(): Promise<void> {
  await windowService.close();
}

export async function maximizeWindow(): Promise<void> {
  await windowService.maximize();
}

export async function restoreWindow(): Promise<void> {
  await windowService.restore();
}

export async function minimizeWindow(): Promise<void> {
  await windowService.minimize();
}

export async function dragWindow(): Promise<void> {
  await windowService.drag();
}

export async function reloadWindow(force = false): Promise<void> {
  if (force) {
    await windowService.reloadForce();
  } else {
    await windowService.reload();
  }
}

export async function toggleDevTools(): Promise<void> {
  await windowService.toggleDevTools();
}
