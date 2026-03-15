import { windowService } from '../../../gateway/services/window-service';

export async function minimizeWindow(): Promise<void> {
  await windowService.minimize();
}
