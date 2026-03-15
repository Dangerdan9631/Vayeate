import { windowService } from '../../../gateway/services/window-service';

export async function restoreWindow(): Promise<void> {
  await windowService.restore();
}
