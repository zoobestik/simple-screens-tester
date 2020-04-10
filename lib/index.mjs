import { debug as showDebug } from './config';

export const debug = process.env.APP_DEBUG || showDebug
  ? (...args) => console.log(...args)
  : () => null;
