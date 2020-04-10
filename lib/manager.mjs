import { debug } from "./index.mjs";

export function createPageIterator(browser, operation, poolSize) {
  const pageThreads = new Array(poolSize || 1);

  const iter = _createThreadsIterator(browser, pageThreads, operation);

  const wait = async () => {
    await Promise.allSettled(pageThreads);
    await iter.return(null);
  };

  return [ iter, wait ];
}

async function* _createThreadsIterator(browser, pageThreads, operation) {
  const pages = new Array(pageThreads.length);

  for (let i = 0; i < pages.length; i++) {
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
            console.log("\t![operation error]:", url, e);
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
