import { debug } from "./index.mjs";

export function createBrowserQueue(browser, operation, poolSize) {
  const pageThreads = new Array(poolSize || 1);
  const pages = new Array(pageThreads.length);

  for (let i = 0; i < pages.length; i++) {
    pageThreads[i] = browser.newPage().then((page) => (pages[i] = page));
  }

  const add = async (...args) => {
    debug("\twaiting free thread...");
    try {
      const page = await Promise.any(pageThreads);
      const index = pages.indexOf(page);

      if (index === -1) {
        const e = new Error("Internal error: unexpected page?");
        e.page = page;
        throw e;
      }

      debug(`\tready thread ${index + 1} | ${pageThreads.length}`);

      pageThreads[index] = (async function doOperation() {
        debug(`\texecute operation in ${index + 1} | ${pageThreads.length}`);

        try {
          await operation(page, ...args);
        } catch (e) {
          console.log("\t![operation error]:", e);
        }

        return page;
      })();
    } catch (e) {
      if (e instanceof AggregateError)
        console.error("All tabs failed?", pageThreads);
      else throw e;
    }
  };

  const wait = () => Promise.allSettled(pageThreads);

  return [add, wait];
}
