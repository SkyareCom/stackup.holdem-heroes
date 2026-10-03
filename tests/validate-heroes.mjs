import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

expect(html.includes('"heroes.lang"'), 'missing heroes.lang storage key');
expect(html.includes('"heroes.session"'), 'missing heroes.session storage key');

expect(!html.includes('store.set("wraps.lang"'), 'legacy wraps.lang must not receive new writes');
expect(!html.includes('store.set("wraps.session"'), 'legacy wraps.session must not receive new writes');

for (const phrase of [
  'Treine situações específicas de PLO',
  'Tudo pronto para treinar PLO.',
  'Train specific PLO situations',
  'All set to train PLO.',
  'Entrena situaciones específicas de PLO',
  'Todo listo para entrenar PLO.'
]) {
  expect(!html.includes(phrase), `inherited PLO copy still present: ${phrase}`);
}

if (failures.length) {
  console.error('Heroes validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Heroes identity validation passed.');
