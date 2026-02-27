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
      if (shouldLog('debug')) console.debug(prefix, ...args);
    },
    info: (...args: unknown[]) => {
      if (shouldLog('info')) console.info(prefix, ...args);
    },
    warn: (...args: unknown[]) => {
      if (shouldLog('warn')) console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      if (shouldLog('error')) console.error(prefix, ...args);
    },
  };
}
