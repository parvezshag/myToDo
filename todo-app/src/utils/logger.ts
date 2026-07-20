type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const PREFIX = '[TodoApp]';

function format(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === 'string') return a;
      if (a instanceof Error) return `${a.message}\n${a.stack ?? ''}`;
      try {
        return JSON.stringify(a, null, 2);
      } catch {
        return String(a);
      }
    })
    .join(' ');
}

export const logger = {
  debug(...args: unknown[]): void {
    if (import.meta.env?.DEV) {
      console.debug(PREFIX, format(args));
    }
  },
  info(...args: unknown[]): void {
    console.info(PREFIX, format(args));
  },
  warn(...args: unknown[]): void {
    console.warn(PREFIX, format(args));
  },
  error(...args: unknown[]): void {
    console.error(PREFIX, format(args));
  },
};
