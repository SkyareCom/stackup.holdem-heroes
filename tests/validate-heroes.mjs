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


// Unified Poker DNA / usage data architecture.
expect((html.match(/\{key:"/g)||[]).length>=30, 'Poker DNA must expose at least 30 indicator definitions');
for (const token of [
  'heroes.profileAccumulator.v4',
  'heroes.usage.v1',
  'RECENT_DECISION_LIMIT=500',
  'function updateProfileAccumulator',
  'function getUnifiedPlayerProfile',
  'indicatorConfidence',
  'function buildTrainingRecommendations',
  'data-training-focus',
  'heroes-player-profile-v4'
]) {
  expect(html.includes(token), `missing synchronized HEROES data capability: ${token}`);
}
expect(!html.includes('mode:"mock"'), 'mock session mode must not be used in the published HEROES app');
expect(html.includes('updateProfileAccumulator(decision)'), 'every spot decision must update lifetime DNA accumulator');
expect(html.includes('trackUsage("spot_viewed"'), 'viewing a solved spot must update usage history');
expect(html.includes('trackUsage("decision"'), 'taking an action must update usage history');
expect(html.includes('shouldPublishProfileToBridge'), 'cross-app profile sync must be throttled instead of publishing every interaction');

if (failures.length) {
  console.error('Heroes validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Heroes identity validation passed.');
