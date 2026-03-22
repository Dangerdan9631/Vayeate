import { describe, it, expect, vi } from 'vitest';
import { LogService } from '../../gateway/services/log-service';
import { Logger, LoggerFactory } from './logger';

describe('Logger', () => {
  it('forwards to logService.log with category', () => {
    const log = vi.fn();
    const logService = { log } as unknown as LogService;
    const logger = new Logger(logService, 'Tag');
    logger.info('hello');
    expect(log).toHaveBeenCalledWith('info', 'Tag', 'hello');
  });
});

describe('LoggerFactory', () => {
  it('create returns Logger bound to injected LogService', () => {
    const log = vi.fn();
    const logService = { log } as unknown as LogService;
    const factory = new LoggerFactory(logService);
    factory.create('Cat').warn('x');
    expect(log).toHaveBeenCalledWith('warn', 'Cat', 'x');
  });
});
