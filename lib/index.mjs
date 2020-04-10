export const debug = process.env.APP_DEBUG
  ? (...args) => console.log(...args)
  : () => null;
