import { env } from '@xl-vision/utils';
import { voidFn } from './function';

export default env.isDevelopment
  ? (condition: boolean, format: string, ...args: Array<string>) => {
      if (condition) {
        printWarning(format, args);
      }
    }
  : voidFn;

const printWarning = (format: string, args: Array<string>) => {
  let index = 0;
  const message = `Warning: ${format.replace(/%s/g, () => args[index++])}`;

  if (typeof console !== 'undefined') {
    console.error(message);
  }

  try {
    // --- Welcome to debugging React ---
    // This error was thrown as a convenience so that you can use this stack
    // to find the callsite that caused this warning to fire.
    throw new Error(message);
    // eslint-disable-next-line no-empty
  } catch (x) {}
};
