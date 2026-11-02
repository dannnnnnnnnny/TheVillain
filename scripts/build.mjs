import {cp, mkdir, readdir, rm, stat} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
for (const path of ['index.html', 'style.css', 'src', 'public/assets', 'THIRD_PARTY_NOTICES.md']) {
  const target = new URL(path, output);
  await mkdir(new URL('./', target), {recursive: true});
  await cp(new URL(path, root), target, {recursive: true});
}

let files = 0;
let bytes = 0;
async function inspect(directory) {
  for (const item of await readdir(directory, {withFileTypes: true})) {
    const path = new URL(item.name, directory);
    if (item.isDirectory()) await inspect(new URL(item.name + '/', directory));
    else { files++; bytes += (await stat(path)).size; }
  }
}
await inspect(output);
console.log(`Built ${files} public game files (${(bytes / 1024 / 1024).toFixed(1)} MiB) in dist/`);
