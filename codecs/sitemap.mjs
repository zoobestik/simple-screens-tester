import { promises as fs } from "fs";

const { readFile } = fs;

async function readSitemapUrls(path) {
  const urls = [];
  const content = await readFile(path, "utf8");

  for (const match of content.matchAll(/<loc>(.+)<\/loc>/g)) {
    if (match && match[1]) urls.push(match[1]);
  }

  return urls;
}

export default readSitemapUrls;
