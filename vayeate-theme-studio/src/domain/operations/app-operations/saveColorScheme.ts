import { configService } from '../../../gateway/services/config-service';

/** Persist the active color scheme to the app config file via IPC. */
export async function saveColorScheme(scheme: 'light' | 'dark'): Promise<void> {
  await configService.save({ colorScheme: scheme });
}
