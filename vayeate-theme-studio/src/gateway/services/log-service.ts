export type RendererLogLevel = 'debug' | 'info' | 'warn' | 'error';

export function sendLog(level: RendererLogLevel, tag: string, args: string[]): void {
  try {
    window.electronAPI?.sendLog?.(level, tag, args);
  } catch {
    // ignore when not in Electron or sendLog unavailable
  }
}
