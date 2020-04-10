import "core-js";
import { constants, promises as fs } from 'fs';
import puppeteer from 'puppeteer';
import mkdirp from "mkdirp";
import looksSame from "looks-same";

const { readFile } = fs;

// const debug = (...args) => console.log(...args);
const debug = (...args) => {};

const readUrls = async path => {
    const urls = [];
    const content = await readFile(path,  'utf8');

    for (const match of content.matchAll(/<loc>(.+)<\/loc>/g)) {
        if (match && match[1] && !(
            match[1].endsWith('.json') ||
            match[1].endsWith('.pdf') ||
            match[1].endsWith('.yml')
        )) {
            urls.push(match[1]);
        }
    }

    return urls;
};


async function equalsImages(reference, current) {
    return new Promise((resolve, reject) => {
        const finish = (err, data) => {
            if (err) reject(err);
            else resolve(data);
        };

        looksSame(reference, current, { strict: true }, finish)
    });
}

function createDiff(data) {
    return new Promise((resolve, reject) => {
        const finish = (err, data) => {
            if (err) reject(err);
            else resolve(data);
        };

        looksSame.createDiff(data, finish);
    })
}

async function createScreens(page, path) {
    const current = `screens/${ path }`;
    const currentFile = `${ current }/screen.png`;

    await mkdirp(current);

    debug('\t\tscreen', path);

    await page.screenshot({
        path: `${ currentFile }`,
        fullPage: true,
    });

    const reference = `refs/${ path }`;
    const referenceFile = `${ reference }/screen.png`;

    let newPage = true;

    try {
        await fs.access(reference, constants.F_OK);
        newPage = false;
    } catch (e) {
    }

    if (newPage) console.log('![new page]', path);
    else {
        const { equal } = await equalsImages(currentFile, referenceFile);
        if (!equal) {
            console.log('![differ]', path);

            const diff = `diffs/${ path }`;
            const diffFile = `${ diff }/screen.png`;

            await mkdirp(diff);

            await createDiff({
                reference: referenceFile,
                current: currentFile,
                diff: diffFile,
                strict: true,
            });
        }
    }
}

async function request(page, url) {
    debug('\t\tgoto', url);
    await page.goto(url, { waitUntil: 'networkidle0' });

    debug('\t\tscreens', url);
    await createScreens(page, new URL(url).pathname);

    debug('\t\tdone', url);
}

async function* createTabs(browser, maxSize) {
    const size = maxSize || 1;

    const pages = new Array(maxSize);
    const pageThreads = new Array(maxSize);

    for(let i =0; i < size; i++) {
        pageThreads[i] = browser.newPage().then(page => (pages[i] = page));
    }

    while(true) {
        debug('\twaiting free thread...');
        try {
            const page = await Promise.any(pageThreads);
            const index = pages.indexOf(page);

            debug('\tfree thread', index + 1, 'of', pages.length, 'are ready');

            const get = url => {
                debug('\tgetter for', index + 1, 'of', pages.length, url);
                pageThreads[index] = (async () => {
                    try {
                        await request(page, url)
                    } catch (e) {
                        console.log('![request error]:', e);
                    }
                    return page;
                })();
            };

            yield get;
        } catch (e) {
            if (e instanceof AggregateError) console.error('All tabs failed?', pageThreads);
            else throw e;
        }
    }
}

(async () => {
    console.log('init...');
    const [ browser, urls ] = await Promise.all([
        puppeteer.launch(),
        readUrls('./sitemap.xml')
    ]);

    const length = urls.length;
    const tabs = createTabs(browser, 15);

    for await (const get of tabs) {
        if (!urls.length) break;

        const url = urls.pop();
        console.log(`get ${length - urls.length} of ${length} - ${url}`);
        get(url);
    }

    console.log('done.')
})()
    .catch(e => console.log(e));
