import "core-js";
import puppeteer from "puppeteer";
import config from './lib/config.mjs';

import { readSitemapUrls } from "./lib/files.mjs";
import { createPageIterator } from "./lib/manager.mjs";
import { captureScreens } from "./lib/screens.mjs";

async function process(page, url) {
  await page.goto(url, { waitUntil: "networkidle0" });
  await captureScreens(page, new URL(url).pathname);
}

(async () => {
  console.log("init...");
  const [browser, urls] = await Promise.all([
    puppeteer.launch(config.launch || {}),
    readSitemapUrls("./output/sitemap.xml"),
  ]);

  const length = urls.length;
  const [ tabs, pollClose ] = createPageIterator(browser, process, config.poolSize);

  for await (const get of tabs) {
    if (!urls.length) break;

    const url = urls.pop();
    console.log(`get ${length - urls.length} of ${length} - ${url}`);
    get(url);
  }

  await pollClose();
  await browser.close();
})()
  .then(() => console.log("done."))
  .catch((e) => console.log(e));
