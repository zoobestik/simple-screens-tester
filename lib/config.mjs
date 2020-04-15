import { join } from 'path';
import { readJSONsync } from "./files.mjs";

const DEFAULT_OPTIONS = {
  debug: false,
  poolSize: 15,
  tolerance: 6,
  launch: {
    // ...
  }
};

let config = {};

try {
  config = readJSONsync(join(process.cwd(), 'config.json'));
} catch (e) {
  console.log('config not found...');
}

const merged = {
  ...DEFAULT_OPTIONS,
  ...config,
  launch: {
    ...DEFAULT_OPTIONS.launch,
    ...(config.launch || {})
  }
};

if (process.env.APP_DEBUG) merged.debug = process.env.APP_DEBUG;
if (process.env.APP_EXECUTABLE_PATH) merged.launch.executablePath = process.env.APP_EXECUTABLE_PATH;

export default merged;
