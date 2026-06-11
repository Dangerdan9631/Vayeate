import type { BrowserWindow } from 'electron';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Serialize log args for IPC so main process logs appear in renderer DevTools console. No-op if window is closed/destroyed.
 */
export function forwardMainLog(
  getMainWindow: () => BrowserWindow | null,
  level: LogLevel,
  ...args: unknown[]
): void {
  const win = getMainWindow();
  if (win == null) return;
  try {
    if (win.webContents.isDestroyed()) return;
    const serialized = args.map((a) =>
      a instanceof Error ? a.message : typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a),
    );
    win.webContents.send('main-log', level, serialized);
  } catch {
    // Window can be destroyed during close; ignore "Object has been destroyed" and similar
  }
}

/**
 * Wrap console so main process logs also go to the renderer (DevTools) and use console.log for debug so the IDE console shows all levels.
 */
export function installMainLogForwarding(getMainWindow: () => BrowserWindow | null): void {
  const orig = {
    debug: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  console.debug = (...args: unknown[]) => {
    orig.debug(...args);
    forwardMainLog(getMainWindow, 'debug', ...args);
  };
  console.info = (...args: unknown[]) => {
    orig.info(...args);
    forwardMainLog(getMainWindow, 'info', ...args);
  };
  console.warn = (...args: unknown[]) => {
    orig.warn(...args);
    forwardMainLog(getMainWindow, 'warn', ...args);
  };
  console.error = (...args: unknown[]) => {
    orig.error(...args);
    forwardMainLog(getMainWindow, 'error', ...args);
  };
}
