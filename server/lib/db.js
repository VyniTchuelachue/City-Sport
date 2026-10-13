import { readFileSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Imported, not just read from disk, so that hosts which package only the files
// the code imports (Vercel) are certain to ship the catalogue with the server.
import bundledBrands from '../data/brands.json' with { type: 'json' };
import bundledProducts from '../data/products.json' with { type: 'json' };
import bundledStores from '../data/stores.json' with { type: 'json' };

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

// Starts from the imported copy. Where the JSON file sits on disk beside the code
// (your own server), an edit is picked up on the next request, with no restart.
function jsonFile(file, bundled) {
  const target = path.join(dataDir, file);
  let current = bundled;
  let stamp = null;
  let rejected = null;

  return () => {
    let mtimeMs;
    try {
      ({ mtimeMs } = statSync(target));
    } catch {
      return current; // no file on disk in this deployment: the imported copy is the data
    }
    if (stamp === null) stamp = mtimeMs;
    if (mtimeMs === stamp || mtimeMs === rejected) return current;
    try {
      current = JSON.parse(readFileSync(target, 'utf8'));
      stamp = mtimeMs;
    } catch (err) {
      // A half-saved or invalid file must not take the site down: keep the last good data.
      rejected = mtimeMs;
      console.warn(`[data] ${file} was not reloaded: ${err.message}`);
    }
    return current;
  };
}

export const getProducts = jsonFile('products.json', bundledProducts);
export const getStores = jsonFile('stores.json', bundledStores);
export const getBrands = jsonFile('brands.json', bundledBrands);

// Appends are chained so two submissions arriving together cannot overwrite each other.
let queue = Promise.resolve();

export function appendRecord(file, record) {
  const target = path.join(dataDir, file);
  const next = queue.then(async () => {
    let list = [];
    try {
      list = JSON.parse(await readFile(target, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    list.push(record);
    await writeFile(target, JSON.stringify(list, null, 2));
  });
  queue = next.catch(() => {});
  return next;
}
