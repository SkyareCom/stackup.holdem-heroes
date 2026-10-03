import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

expect(/^<!doctype html>/i.test(html.trimStart()), 'document must start with <!doctype html>');
expect(/<html\s+lang=["']pt-BR["']/i.test(html), 'html lang must be pt-BR');
expect(/<head>/i.test(html) && /<\/head>/i.test(html), 'document head is missing');
expect(/<meta\s+name=["']viewport["'][^>]*width=device-width/i.test(html), 'mobile viewport meta is missing');


const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]);
const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

expect(duplicates.length === 0, `duplicate DOM ids: ${duplicates.join(', ')}`);

for (const id of ['app','splash','welcome','home','view','tabbar']) {
  expect(ids.includes(id), `missing essential DOM id: ${id}`);
}

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(m => m[1])
  .filter(code => code.trim());

expect(scripts.length === 1, `expected exactly one inline app script, found ${scripts.length}`);

for (const [index, code] of scripts.entries()) {
  try {
    new Function(code);
  } catch (error) {
    failures.push(`inline script ${index + 1} has invalid JavaScript: ${error.message}`);
  }
}

expect(!/store\.set\("wraps\./.test(html), 'legacy wraps.* writes remain in app code');

for (const phrase of [
  'Treine situações específicas de PLO',
  'Tudo pronto para treinar PLO.',
  'Train specific PLO situations',
  'All set to train PLO.',
  'Entrena situaciones específicas de PLO',
  'Todo listo para entrenar PLO.'
]) {
  expect(!html.includes(phrase), `inherited PLO copy remains: ${phrase}`);
}

if (failures.length) {
  console.error('HTML/runtime validation failed:');
  failures.forEach(f => console.error('- ' + f));
  process.exit(1);
}

console.log('HTML/runtime validation passed.');
