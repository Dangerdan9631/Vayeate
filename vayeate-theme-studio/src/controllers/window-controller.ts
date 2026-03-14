import { windowService } from '../services/window-service';

export async function handleViewMenuReload(): Promise<void> {
  await windowService.reload();
}

export async function handleViewMenuForceReload(): Promise<void> {
  await windowService.reloadForce();
}

export async function handleViewMenuToggleDevTools(): Promise<void> {
  await windowService.toggleDevTools();
}
