import { windowService } from '../../../gateway/services/window-service';

export async function dragWindow(): Promise<void> {
  await windowService.drag();
}
