import { saveColorScheme as saveColorSchemeOp } from '../../operations/app-operations';

/** Persist the active color scheme to disk. */
export async function saveColorScheme(scheme: 'light' | 'dark'): Promise<void> {
  await saveColorSchemeOp(scheme);
}
