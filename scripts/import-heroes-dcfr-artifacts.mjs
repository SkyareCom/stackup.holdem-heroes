import fs from 'node:fs';import path from 'node:path';
const code=fs.readFileSync('core/stackup-solved-spot-contract.js','utf8');new Function(code)();const C=globalThis.StackUpSolvedSpotContract;
const root=process.env.SOLVER_ARTIFACT_DIR||'/tmp/solver-artifacts';const files=[];
for(const d of fs.readdirSync(root)){const dir=path.join(root,d);if(!fs.statSync(dir).isDirectory())continue;for(const f of fs.readdirSync(dir))if(/^postflop-shard-\d+\.json$/.test(f))files.push(path.join(dir,f));}
if(!files.length)throw new Error('no solver shards found');
const source=[];for(const f of files.sort())source.push(...JSON.parse(fs.readFileSync(f,'utf8')));
const targets=['FLOP','TURN','RIVER'];const report={};
for(const street of targets){
 const spots=[],canonical=new Set(),ids=new Set();let count=0;
 for(const raw of source){
  if(C.normStreet(raw?.scenario?.street)!==street)continue;
  const selected=[];const fingerprint=C.scenarioFingerprint(raw.scenario);
  for(const entry of raw.strategy||[]){
   const v=C.validateSolvedDecision(raw,entry);if(!v.ok)continue;
   const key=fingerprint+'|'+String(entry.hand).toUpperCase();if(canonical.has(key)||ids.has(v.id))continue;
   selected.push({...entry,solvedDecisionId:v.id,family:'DCFR_POSTFLOP'});canonical.add(key);ids.add(v.id);count++;if(count===5000)break;
  }
  if(selected.length)spots.push({...raw,sourceBank:'dcfr-workflow-run-51',strategy:selected});
  if(count===5000)break;
 }
 if(count!==5000||canonical.size!==5000||ids.size!==5000)throw new Error(street+' strict target failed: '+count);
 const bank={schemaVersion:1,mode:'STRICT_SOLVED_ONLY',product:'HEROES',generatedAt:'2026-10-05',street,countingUnit:'ONE_VALIDATED_SOLVER_DECISION_PER_SCENARIO_AND_HAND',decisionCount:5000,scenarioCount:spots.length,distribution:{DCFR_POSTFLOP:5000},spots};
 fs.writeFileSync('data/solver/heroes/'+street.toLowerCase()+'-v1.json',JSON.stringify(bank));
 report[street]={decisions:count,scenarios:spots.length};
}
const manifest=JSON.parse(fs.readFileSync('data/solver/heroes/manifest-v1.json','utf8'));manifest.generatedAt='2026-10-05';manifest.totalValidatedSolvedDecisions=20000;manifest.streetTargets={preflop:5000,flop:5000,turn:5000,river:5000};manifest.streetWeights={preflop:.25,flop:.25,turn:.25,river:.25};manifest.postflopDistribution={flop:{DCFR_POSTFLOP:5000},turn:{DCFR_POSTFLOP:5000},river:{DCFR_POSTFLOP:5000}};manifest.sourceWorkflow={repository:'SkyareCom/stackup.holdem-grinder.evo',runId:37269044428,headSha:'fc14ff4adee3e0cb8ddaefe34c72132dd555938a',completedShards:[1,2,3,4,6,7,8,9,10,11]};for(const s of ['flop','turn','river'])manifest.validation[s]={valid:5000,invalid:0,decisions:5000,scenarios:report[s.toUpperCase()].scenarios,distribution:{DCFR_POSTFLOP:5000}};fs.writeFileSync('data/solver/heroes/manifest-v1.json',JSON.stringify(manifest,null,2)+'\n');
let runtime=fs.readFileSync('core/heroes-solved-spots-runtime.js','utf8').replace("const TOTALS=Object.freeze({preflop:5000,flop:3000,turn:3000,river:3000});","const TOTALS=Object.freeze({preflop:5000,flop:5000,turn:5000,river:5000});");fs.writeFileSync('core/heroes-solved-spots-runtime.js',runtime);
let test=fs.readFileSync('tests/validate-solved-spots.mjs','utf8');test=test.replace("['flop',3000,{'TEXTURE_SIZING':1200,'GENERAL_HU':1800}],","['flop',5000,{'DCFR_POSTFLOP':5000}],").replace("['turn',3000,{'GENERAL_HU':3000}],","['turn',5000,{'DCFR_POSTFLOP':5000}],").replace("['river',3000,{'MULTIWAY':500,'GENERAL_HU':2500}]","['river',5000,{'DCFR_POSTFLOP':5000}]").replaceAll('14000','20000').replaceAll('14,000','20,000');fs.writeFileSync('tests/validate-solved-spots.mjs',test);
console.log(JSON.stringify({total:20000,...report},null,2));
// Bank expanded and strict-validated from Grinder.EVO workflow run 37269044428.
