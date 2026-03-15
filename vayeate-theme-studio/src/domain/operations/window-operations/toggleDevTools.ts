import { windowService } from '../../../gateway/services/window-service';

export async function toggleDevTools(): Promise<void> {
  await windowService.toggleDevTools();
}
