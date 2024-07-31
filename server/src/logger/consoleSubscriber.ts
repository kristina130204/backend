import { LogLevel, Subscriber } from './logger';

// PATTERN: Observer
class ConsoleSubscriber implements Subscriber {
  update(level: LogLevel, message: string): void {
    if (level === 'error') {
      console.error(`[${level.toUpperCase()}] ${message}`);
    }
  }
}

export { ConsoleSubscriber };