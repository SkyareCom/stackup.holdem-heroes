import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));

for (const file of ['stackup-app-bridge.js']) {
  const src=path.join(root,file);
  if(fs.existsSync(src))fs.copyFileSync(src,path.join(dist,file));
}
for (const dir of ['core','data']) {
  const src=path.join(root,dir);
  if(fs.existsSync(src))fs.cpSync(src,path.join(dist,dir),{recursive:true});
}

console.log('Built HEROES Pages artifact with index, bridge, core runtime and solver data');
