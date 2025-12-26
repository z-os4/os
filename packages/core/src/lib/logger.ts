// Simple logger for zOS
const isDev = typeof window !== 'undefined' && window.location?.hostname === 'localhost';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const noop = () => {};

const createLogMethod = (level: LogLevel) => {
  if (!isDev && level === 'debug') return noop;

  return (...args: unknown[]) => {
    const prefix = `[zOS:${level}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        break;
    }
  };
};

export const logger = {
  debug: createLogMethod('debug'),
  info: createLogMethod('info'),
  warn: createLogMethod('warn'),
  error: createLogMethod('error'),
  log: createLogMethod('info'),
};

export default logger;
