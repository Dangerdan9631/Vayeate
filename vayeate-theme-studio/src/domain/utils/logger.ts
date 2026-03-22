import { singleton } from 'tsyringe';
import { LogService } from '../../gateway/services/log-service';

export class Logger {
  constructor(
    private readonly logService: LogService,
    readonly category: string,
  ) {}

  debug(...args: unknown[]): void {
    this.logService.log('debug', this.category, ...args);
  }

  info(...args: unknown[]): void {
    this.logService.log('info', this.category, ...args);
  }

  warn(...args: unknown[]): void {
    this.logService.log('warn', this.category, ...args);
  }

  error(...args: unknown[]): void {
    this.logService.log('error', this.category, ...args);
  }
}

@singleton()
export class LoggerFactory {
  constructor(private readonly logService: LogService) {}

  create(category: string): Logger {
    return new Logger(this.logService, category);
  }
}
