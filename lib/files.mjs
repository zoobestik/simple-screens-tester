import { promises as fs } from "fs";

const { readFile } = fs;

export const readSitemapUrls = async (path) => {
  const urls = [];
  const content = await readFile(path, "utf8");

  for (const match of content.matchAll(/<loc>(.+)<\/loc>/g)) {
    if (
      match &&
      match[1] &&
      !(
        match[1].endsWith(".json") ||
        match[1].endsWith(".pdf") ||
        match[1].endsWith(".yml")
      )
    ) {
      urls.push(match[1]);
    }
  }

  return urls;
};
