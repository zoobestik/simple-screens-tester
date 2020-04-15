import looksSame from "looks-same";
import config from './config.mjs';

export function equalsImages(reference, current) {
  return new Promise((resolve, reject) => {
    const finish = (err, data) => {
      if (err) reject(err);
      else resolve(data);
    };

    looksSame(reference, current, { tolerance: config.tolerance }, finish);
  });
}

export function createDiff(data) {
  return new Promise((resolve, reject) => {
    const finish = (err, data) => {
      if (err) reject(err);
      else resolve(data);
    };

    looksSame.createDiff(data, finish);
  });
}
