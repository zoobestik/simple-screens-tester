import config from './config.mjs';

export const debug = config.debug
  ? (...args) => console.log(...args)
  : () => null;
