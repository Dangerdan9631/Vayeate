export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

let currentLevel: LogLevel = 'debug';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel];
}

function formatTag(tag: string): string {
  return `[${tag}]`;
}

/** Serialize one log argument for IPC to main process (IDE console). */
function serializeArg(a: unknown): string {
  if (a instanceof Error) return a.message;
  if (typeof a === 'object' && a !== null) return JSON.stringify(a);
  return String(a);
}

type RendererLogLevel = 'debug' | 'info' | 'warn' | 'error';

function sendToMain(level: RendererLogLevel, tag: string, args: unknown[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.electronAPI?.sendLog?.(level, tag, args.map(serializeArg));
  } catch {
    // ignore when not in Electron or sendLog unavailable
  }
}

export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export function createLogger(tag: string): Logger {
  const prefix = formatTag(tag);
  return {
    debug: (...args: unknown[]) => {
      if (shouldLog('debug')) {
        console.debug(prefix, ...args);
        sendToMain('debug', tag, args);
      }
    },
    info: (...args: unknown[]) => {
      if (shouldLog('info')) {
        console.info(prefix, ...args);
        sendToMain('info', tag, args);
      }
    },
    warn: (...args: unknown[]) => {
      if (shouldLog('warn')) {
        console.warn(prefix, ...args);
        sendToMain('warn', tag, args);
      }
    },
    error: (...args: unknown[]) => {
      if (shouldLog('error')) {
        console.error(prefix, ...args);
        sendToMain('error', tag, args);
      }
    },
  };
}
