import { readFileSync } from "fs";

export function readJSONSync(path) {
  const content = readFileSync(path);
  return JSON.parse(content.toString("utf8"));
}
