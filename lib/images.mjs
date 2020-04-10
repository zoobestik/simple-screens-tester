import { tolerance } from './config.json';
import looksSame from "looks-same";

export function equalsImages(reference, current) {
  return new Promise((resolve, reject) => {
    const finish = (err, data) => {
      if (err) reject(err);
      else resolve(data);
    };

    looksSame(reference, current, { tolerance }, finish);
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
