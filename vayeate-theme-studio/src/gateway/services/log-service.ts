import { singleton } from 'tsyringe';
import type { LogLevel } from './log-service-types';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function serializeArg(a: unknown): string {
  if (a instanceof Error) return a.message;
  if (typeof a === 'object' && a !== null) return JSON.stringify(a);
  return String(a);
}

function logTimestamp(): string {
  return new Date().toISOString();
}

@singleton()
export class LogService {
  private currentLevel: LogLevel = 'debug';

  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  getLogLevel(): LogLevel {
    return this.currentLevel;
  }

  init(): void {
    this.getAPI().onMainLog?.((level, args) => {
      this.logToConsole(level, 'Main', logTimestamp(), ...args);
    });
  }

  log(severity: LogLevel, tag: string, ...args: unknown[]): void {
    if (LEVEL_ORDER[severity] < LEVEL_ORDER[this.currentLevel]) return;

    const ts = logTimestamp();
    this.logToConsole(severity, tag, ts, ...args);
    this.getAPI().sendLog?.(severity, tag, [ts, ...args.map(serializeArg)]);
  }

  private logToConsole(severity: LogLevel, tag: string, timestamp: string, ...args: unknown[]): void {
    try {
      console[severity](`[${timestamp}] [${tag}]`, ...args);
    } catch {
      // ignore console failures
    }
  }
}
