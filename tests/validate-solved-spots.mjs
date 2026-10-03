import fs from 'node:fs';

const failures=[];
const expect=(condition,message)=>{if(!condition)failures.push(message)};

const contractCode=fs.readFileSync(new URL('../core/stackup-solved-spot-contract.js',import.meta.url),'utf8');
new Function(contractCode)();
const C=globalThis.StackUpSolvedSpotContract;
expect(!!C,'solved spot contract must load');

const specs=[
  ['preflop',5000,{'MULTIWAY_ALLIN':300,'ICM_PKO':500,'SHOVE_RESHOVE':900,'SQUEEZE_LIMP_ISO':500,'BLIND_WAR_HU':500,'THREEBET_4BET':900,'VS_RFI':700,'RFI':700}],
  ['flop',3000,{'TEXTURE_SIZING':1200,'GENERAL_HU':1800}],
  ['turn',3000,{'GENERAL_HU':3000}],
  ['river',3000,{'MULTIWAY':500,'GENERAL_HU':2500}]
];

const ids=new Set();
const canonical=new Set();
let total=0;

for(const [street,target,distribution] of specs){
  const bank=JSON.parse(fs.readFileSync(new URL(`../data/solver/heroes/${street}-v1.json`,import.meta.url),'utf8'));
  expect(bank.mode==='STRICT_SOLVED_ONLY',`${street} bank must be strict solved-only`);
  expect(bank.decisionCount===target,`${street} bank must contain exactly ${target} decisions`);
  expect(JSON.stringify(bank.distribution)===JSON.stringify(distribution),`${street} distribution mismatch`);
  let counted=0;
  for(const spot of bank.spots||[]){
    for(const entry of spot.strategy||[]){
      counted++;
      const verdict=C.validateSolvedDecision(spot,entry);
      expect(verdict.ok,`invalid solved decision in ${street}: ${entry.hand} :: ${verdict.errors?.join(',')}`);
      expect(!ids.has(entry.solvedDecisionId),`duplicate solvedDecisionId: ${entry.solvedDecisionId}`);
      ids.add(entry.solvedDecisionId);
      const key=C.scenarioFingerprint(spot.scenario)+'|'+String(entry.hand).toUpperCase();
      expect(!canonical.has(key),`duplicate scenario+hand decision: ${key}`);
      canonical.add(key);
    }
  }
  expect(counted===target,`${street} enumerated count ${counted} != ${target}`);
  total+=counted;
}

expect(total===14000,'total solved decision bank must be 14,000');
expect(ids.size===14000,'all solved decision IDs must be unique');
expect(canonical.size===14000,'all scenario+hand decisions must be canonically unique');

const manifest=JSON.parse(fs.readFileSync(new URL('../data/solver/heroes/manifest-v1.json',import.meta.url),'utf8'));
expect(manifest.totalValidatedSolvedDecisions===14000,'manifest total must be 14,000');
expect(manifest.noRepeatPolicy==='PERSISTENT_WITHOUT_REPLACEMENT_UNTIL_BANK_EXHAUSTION','manifest must enforce no-repeat cycle');

const runtime=fs.readFileSync(new URL('../core/heroes-solved-spots-runtime.js',import.meta.url),'utf8');
expect(runtime.includes("const SEEN_KEY='heroes.solvedSpotSeen.v1'"),'runtime must persist seen IDs');
expect(runtime.includes("pool=loaded.flat.filter(x=>!seenSet.has(x.id)"),'runtime must sample without replacement');

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
for(const src of ['core/stackup-solved-spot-contract.js','core/stackup-spots-engine.js','core/heroes-solved-spots-runtime.js']){
  expect(html.includes(`<script src="${src}"></script>`),`missing runtime script: ${src}`);
}
expect(html.includes('await window.HeroesSolvedSpots.next()'),'SPOTS table must request real solved decisions');
expect(html.includes('solver_reference:ref'),'DNA decision context must receive the solver reference');
expect((html.match(/<button[^>]*data-action-slot="/g)||[]).length===7,'SPOTS must expose exactly seven solver-bound action slots');

if(failures.length){
  console.error('Solved spot engine validation failed:');
  failures.slice(0,50).forEach(f=>console.error('- '+f));
  if(failures.length>50)console.error(`... and ${failures.length-50} more`);
  process.exit(1);
}
console.log('Solved spot engine validation passed: 14,000 unique solver decisions.');
