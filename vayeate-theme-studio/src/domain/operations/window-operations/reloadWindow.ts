import { windowService } from '../../../gateway/services/window-service';

export async function reloadWindow(force = false): Promise<void> {
  if (force) {
    await windowService.reloadForce();
  } else {
    await windowService.reload();
  }
}
