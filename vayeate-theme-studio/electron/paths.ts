import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Theme Studio package root (contains data/, electron/).
 */
export const PROJECT_ROOT = resolve(join(__dirname, '..'));

/**
 * Repository-relative data directory: vayeate-theme-studio/data
 */
export const DATA_DIR = join(__dirname, '..', 'data');

/**
 * App icon path (repo root images/icon.png) for window and dock/taskbar.
 */
export const APP_ICON_PATH = join(__dirname, '..', '..', 'images', 'icon.png');

export function resolveSafeProjectRelativePath(rel: string, kind: 'file' | 'dir'): string {
  const trimmed = rel.replace(/\\/g, '/').trim();
  if (!trimmed) {
    throw new Error('Invalid path');
  }
  if (trimmed.startsWith('/') || /^[a-zA-Z]:/.test(trimmed)) {
    throw new Error('Path must be relative');
  }
  let pathPart = trimmed;
  if (kind === 'file') {
    if (pathPart.endsWith('/') || pathPart.endsWith('\\')) {
      throw new Error('Invalid file path');
    }
  } else {
    pathPart = pathPart.replace(/[/\\]+$/, '');
  }
  const segments = pathPart.split('/').filter((s) => s && s !== '.');
  for (const s of segments) {
    if (s === '..') {
      throw new Error('Invalid path segment');
    }
  }
  const rootResolved = resolve(PROJECT_ROOT);
  let abs = rootResolved;
  for (const s of segments) {
    abs = join(abs, s);
  }
  const resolved = resolve(abs);
  const prefix = rootResolved.endsWith(sep) ? rootResolved : rootResolved + sep;
  if (resolved !== rootResolved && !resolved.toLowerCase().startsWith(prefix.toLowerCase())) {
    throw new Error('Path escapes project root');
  }
  return resolved;
}

/**
 * Repo-root `themes/` (extension output); used when renderer saves `exthemes/...` via FileSystemService.
 */
export function resolveExthemesExportFile(rel: string): string {
  const prefix = 'exthemes/';
  if (!rel.startsWith(prefix)) {
    throw new Error('Invalid exthemes path');
  }
  const rest = rel.slice(prefix.length);
  const segments = rest.split(/[/\\]/).filter((s) => s && s !== '.');
  for (const s of segments) {
    if (s === '..') {
      throw new Error('Invalid path segment');
    }
  }
  const themesDir = join(PROJECT_ROOT, '..', 'themes');
  return join(themesDir, ...segments);
}

