export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  constructor(private readonly verbose = false) {}

  info(message: string): void {
    this.log('INFO', message);
  }

  warn(message: string): void {
    this.log('WARN', message);
  }

  error(message: string): void {
    this.log('ERROR', message);
  }

  debug(message: string): void {
    if (this.verbose) {
      this.log('INFO', message);
    }
  }

  private log(level: LogLevel, message: string): void {
    console.log(`[${level}] ${message}`);
  }
}
