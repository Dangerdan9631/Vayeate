import { singleton } from 'tsyringe';
import { LogService } from '../../gateway/services/log-service';

/**
 * Category-scoped logger that forwards messages to {@link LogService}.
 */
export class Logger {
  constructor(
    private readonly logService: LogService,
    readonly category: string,
  ) {}

  /**
   * Logs a debug message under this logger's category.
   *
   * @param args - Values forwarded to the underlying log service.
   */
  debug(...args: unknown[]): void {
    this.logService.log('debug', this.category, ...args);
  }

  /**
   * Logs an info message under this logger's category.
   *
   * @param args - Values forwarded to the underlying log service.
   */
  info(...args: unknown[]): void {
    this.logService.log('info', this.category, ...args);
  }

  /**
   * Logs a warning under this logger's category.
   *
   * @param args - Values forwarded to the underlying log service.
   */
  warn(...args: unknown[]): void {
    this.logService.log('warn', this.category, ...args);
  }

  /**
   * Logs an error under this logger's category.
   *
   * @param args - Values forwarded to the underlying log service.
   */
  error(...args: unknown[]): void {
    this.logService.log('error', this.category, ...args);
  }
}

/**
 * DI factory that creates category-scoped {@link Logger} instances.
 */
@singleton()
export class LoggerFactory {
  constructor(private readonly logService: LogService) {}

  /**
   * Creates a logger bound to the given category label.
   *
   * @param category - Category string attached to each log line from the returned logger.
   * @returns New {@link Logger} forwarding to the injected log service.
   */
  create(category: string): Logger {
    return new Logger(this.logService, category);
  }
}
