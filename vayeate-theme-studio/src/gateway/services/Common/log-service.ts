import { singleton } from 'tsyringe';
import type { LogLevel } from './log-service-types';

/**
 * Numeric ordering used to filter logs below the current level.
 */
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Converts a log argument to a string safe for IPC forwarding.
 *
 * @param a - Value passed to a log call.
 * @returns String representation for the main process.
 */
function serializeArg(a: unknown): string {
  if (a instanceof Error) return a.message;
  if (typeof a === 'object' && a !== null) return JSON.stringify(a);
  return String(a);
}

/**
 * Returns an ISO timestamp for log lines.
 *
 * @returns Current time in ISO 8601 format.
 */
function logTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Renderer logging with level filter, console output, and main-process forwarding.
 */
@singleton()
export class LogService {
  private currentLevel: LogLevel = 'debug';

  /**
   * Returns the Electron preload API or throws outside Electron.
   *
   * @returns Preload `electronAPI` with log methods.
   */
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  /**
   * Sets the minimum severity emitted by this service.
   *
   * @param level - New minimum log level.
   * @returns Nothing.
   */
  setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Returns the current minimum log level.
   *
   * @returns Active severity threshold.
   */
  getLogLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * Subscribes to main-process log events and mirrors them to the console.
   *
   * @returns Nothing.
   */
  init(): void {
    this.getAPI().onMainLog?.((level, args) => {
      this.logToConsole(level, 'Main', logTimestamp(), ...args);
    });
  }

  /**
   * Logs when severity meets the current level; forwards to console and main.
   *
   * @param severity - Message severity.
   * @param tag - Short source label for the log line.
   * @param args - Values to include in the message.
   * @returns Nothing.
   */
  log(severity: LogLevel, tag: string, ...args: unknown[]): void {
    if (LEVEL_ORDER[severity] < LEVEL_ORDER[this.currentLevel]) return;

    const ts = logTimestamp();
    this.logToConsole(severity, tag, ts, ...args);
    this.getAPI().sendLog?.(severity, tag, [ts, ...args.map(serializeArg)]);
  }

  /**
   * Writes a formatted line to the matching console method.
   *
   * @param severity - Console method to use.
   * @param tag - Short source label.
   * @param timestamp - ISO timestamp prefix.
   * @param args - Values to print after the prefix.
   * @returns Nothing.
   */
  private logToConsole(severity: LogLevel, tag: string, timestamp: string, ...args: unknown[]): void {
    try {
      console[severity](`[${timestamp}] [${tag}]`, ...args);
    } catch {
      // ignore console failures
    }
  }
}
