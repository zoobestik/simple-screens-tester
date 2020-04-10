import { debug } from "./index.mjs";

export async function* createPageIterator(browser, operation, poolSize) {
  const size = poolSize || 1;

  const pages = new Array(poolSize);
  const pageThreads = new Array(poolSize);

  for (let i = 0; i < size; i++) {
    pageThreads[i] = browser.newPage().then((page) => (pages[i] = page));
  }

  while (true) {
    debug("\twaiting free thread...");
    try {
      const page = await Promise.any(pageThreads);
      const index = pages.indexOf(page);

      debug("\tfree thread", index + 1, "of", pages.length, "are ready");

      const get = (url) => {
        debug("\tgetter for", index + 1, "of", pages.length, url);
        pageThreads[index] = (async function doOperation() {
          try {
            await operation(page, url);
          } catch (e) {
            console.log("![operation error]:", e);
          }
          return page;
        })();
      };

      yield get;
    } catch (e) {
      if (e instanceof AggregateError)
        console.error("All tabs failed?", pageThreads);
      else throw e;
    }
  }
}
