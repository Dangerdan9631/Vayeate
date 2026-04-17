import { appConfigSchema } from './schema/primitives';
import type { AppConfig } from './schema/primitives';

/**
 * Narrow sync IPC config payload to partial app config (renderer / gateway).
 */
export function parseInitialAppConfig(raw: unknown): Partial<AppConfig> {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const parsed = appConfigSchema.partial().safeParse(raw);
  return parsed.success ? parsed.data : {};
}
