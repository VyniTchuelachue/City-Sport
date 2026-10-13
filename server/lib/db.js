import { readFileSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

// The catalogue and store list are small JSON files kept in memory and re-read
// only when the file changes, so edits in server/data go live without a restart.
function jsonFile(file) {
  const target = path.join(dataDir, file);
  let cached;
  let stamp = 0;
  return () => {
    const { mtimeMs } = statSync(target);
    if (mtimeMs !== stamp) {
      cached = JSON.parse(readFileSync(target, 'utf8'));
      stamp = mtimeMs;
    }
    return cached;
  };
}

export const getProducts = jsonFile('products.json');
export const getStores = jsonFile('stores.json');
export const getBrands = jsonFile('brands.json');

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
