import { appendFileSync } from 'fs';
import { LogLevel, Subscriber } from './logger';

// PATTERN: Observer
class FileSubscriber implements Subscriber {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  update(level: LogLevel, message: string): void {
    const logMessage = `[${level.toUpperCase()}] ${message}\n`;
    appendFileSync(this.filePath, logMessage);
  }
}

export { FileSubscriber };