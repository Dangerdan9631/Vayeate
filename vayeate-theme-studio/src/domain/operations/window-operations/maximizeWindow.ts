import { windowService } from '../../../gateway/services/window-service';

export async function maximizeWindow(): Promise<void> {
  await windowService.maximize();
}
