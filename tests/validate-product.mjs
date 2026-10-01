import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const failures = [];

const expect = (condition, message) => { if (!condition) failures.push(message); };
const read = (p) => fs.existsSync(path.join(root,p)) ? fs.readFileSync(path.join(root,p),'utf8') : '';

const product = read('src/config/product.js');
expect(product.includes("export const PRODUCT_ID = 'heroes'"), 'PRODUCT_ID must be heroes');
expect(product.includes("export const APP_ID = 'com.stackupholdem.heroes'"), 'APP_ID must be com.stackupholdem.heroes');
expect(product.includes("FREE: 'free'"), 'FREE plan constant missing');
expect(product.includes("EDGE: 'edge'"), 'EDGE plan constant missing');
expect(product.includes("FULL: 'full'"), 'FULL plan constant missing');
expect(product.includes("EDGE: 'heroes_edge'"), 'Heroes EDGE store product missing');
expect(product.includes("FULL: 'heroes_full'"), 'Heroes FULL store product missing');

const pkg = read('package.json');
expect(pkg.includes('"build"'), 'package.json build script missing');

const buildScript = read('scripts/build.mjs');
expect(buildScript.includes("dist"), 'build script must produce dist');
expect(buildScript.includes("index.html"), 'build script must copy index.html');

if (failures.length) {
  console.error('Product/build validation failed:');
  failures.forEach(f => console.error('- ' + f));
  process.exit(1);
}
console.log('Product/build validation passed.');
