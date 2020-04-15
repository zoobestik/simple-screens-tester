import "core-js";
import puppeteer from "puppeteer";
import glob from "minimatch";
import config from "./lib/config.mjs";
import { debug } from "./lib/index.mjs";

import readSitemapUrls from "./codecs/sitemap.mjs";
import { createBrowserQueue } from "./lib/queue.mjs";
import { captureScreens } from "./lib/screens.mjs";

async function process(page, url) {
  await page.goto(url, { waitUntil: "networkidle0" });
  debug("\tdownloaded ", url);
  await captureScreens(page, new URL(url).pathname);
  debug("\tcaptured ", url);
}

(async () => {
  console.log("init...");
  const [browser, urls] = await Promise.all([
    puppeteer.launch(config.launch || {}),
    readSitemapUrls("./output/sitemap.xml"),
  ]);

  const [addQueue, waitQueueDone] = createBrowserQueue(
    browser,
    process,
    config.poolSize
  );

  let i = 0;

  for (const url of urls) {
    const isExclude = config.exclude.some((pattern) => glob(url, pattern));

    if (isExclude) {
      console.log(`get ${++i} of ${urls.length} [excluded] ${url}`);
      continue;
    }

    console.log(`get ${++i} of ${urls.length} - ${url}`);
    await addQueue(url);
  }

  await waitQueueDone();
  await browser.close();
})()
  .then(() => console.log("done."))
  .catch((e) => console.log(e));
