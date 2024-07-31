// PATTERN: Observer
export type LogLevel = "info" | "warning" | "error";

export interface Subscriber {
  update(level: LogLevel, message: string): void;
}

class Logger {
  private subscribers: Subscriber[] = [];

  subscribe(subscriber: Subscriber): void {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber: Subscriber): void {
    this.subscribers = this.subscribers.filter((sub) => sub !== subscriber);
  }

  log(level: LogLevel, message: string): void {
    this.subscribers.forEach((subscriber) => subscriber.update(level, message));
  }
}

export const logger = new Logger();
