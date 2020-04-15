import { constants, promises as fs } from "fs";
import mkdirp from "mkdirp";
import { debug } from "./index.mjs";
import { createDiff, equalsImages } from "./images.mjs";
import config from "./config";

export async function captureScreens(page, path) {
  const current = `output/screens/${path}`;
  const currentFile = `${current}/screen.png`;

  await mkdirp(current);

  debug("\t\tscreen", path);

  await page.screenshot({
    path: `${currentFile}`,
    fullPage: true,
  });

  const reference = `output/refs/${path}`;
  const referenceFile = `${reference}/screen.png`;

  let newPage = false;

  try {
    await fs.access(reference, constants.F_OK);
  } catch (e) {
    newPage = true;
  }

  if (newPage) console.log("\t![new page]", path);
  else {
    const { equal } = await equalsImages(currentFile, referenceFile);

    if (!equal) {
      const diff = `output/diffs/${path}`;
      const diffFile = `${diff}/screen.png`;

      await mkdirp(diff);

      await createDiff({
        ...config.compare,
        reference: referenceFile,
        current: currentFile,
        diff: diffFile,
      });

      console.log("\t![differ]", path);
    }
  }
}
