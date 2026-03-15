import { windowService } from '../../../gateway/services/window-service';

export async function closeWindow(): Promise<void> {
  await windowService.close();
}
