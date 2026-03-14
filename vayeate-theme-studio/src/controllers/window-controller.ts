import { windowService } from '../services/window-service';

export async function reloadWindow(): Promise<void> {
  await windowService.reload();
}

export async function forceReloadWindow(): Promise<void> {
  await windowService.reloadForce();
}

export async function toggleDevTools(): Promise<void> {
  await windowService.toggleDevTools();
}
