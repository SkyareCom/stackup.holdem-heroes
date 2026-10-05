/* StackUp Hold'em HEROES — solved spot runtime v1.1
   Session sampling rules:
   - every fresh app session gets a new randomized sequence;
   - no solved decision repeats inside the active sampling cycle;
   - leaving/returning starts a different sequence;
   - only an explicitly saved training may resume its previous sequence/progress. */
(function(global){
'use strict';

const BANKS=Object.freeze({
  preflop:'data/solver/heroes/preflop-v1.json',
  flop:'data/solver/heroes/flop-v1.json',
  turn:'data/solver/heroes/turn-v1.json',
  river:'data/solver/heroes/river-v1.json'
});
const TOTALS=Object.freeze({preflop:5000,flop:3000,turn:3000,river:3000});
const SESSION_KEY='heroes.solvedSpotSession.v2';
const SAVED_TRAINING_KEY='heroes.savedSpotTraining.v1';
const LAST_SESSION_KEY='heroes.lastSpotSession.v1';
const cache=new Map();

function randomInt(max){
  if(max<=1)return 0;
  try{
    const x=new Uint32Array(1);
    global.crypto.getRandomValues(x);
    return x[0]%max;
  }catch(_){return Math.floor(Math.random()*max)}
}
function normalizeStreet(value){
  const s=String(value||'').toLowerCase().replace(/[^a-z]/g,'');
  if(s==='preflop'||s==='pre')return'preflop';
  if(s==='flop')return'flop';
  if(s==='turn')return'turn';
  if(s==='river')return'river';
  return null;
}
function emptySeen(){return{preflop:[],flop:[],turn:[],river:[]}}
function newSession(){
  return {
    id:'hs_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10),
    createdAt:new Date().toISOString(),
    savedTraining:false,
    seen:emptySeen(),
    firstSpotId:null,
    lastSpotId:null,
    viewed:0
  };
}
function parse(storage,key,fallback){
  try{
    const raw=storage?.getItem(key);
    return raw?JSON.parse(raw):fallback;
  }catch(_){return fallback}
}
function write(storage,key,value){
  try{storage?.setItem(key,JSON.stringify(value))}catch(_){}
}
function sessionStore(){return global.sessionStorage||null}
function localStore(){return global.localStorage||null}

function readActiveSession(){
  const storage=sessionStore();
  const current=parse(storage,SESSION_KEY,null);
  if(current?.seen)return current;
  const saved=parse(localStore(),SAVED_TRAINING_KEY,null);
  const next=saved?.active===true&&saved?.session?.seen
    ?{...saved.session,savedTraining:true,resumedAt:new Date().toISOString()}
    :newSession();
  write(storage,SESSION_KEY,next);
  return next;
}
function writeActiveSession(session){
  write(sessionStore(),SESSION_KEY,session);
  if(session?.savedTraining){
    write(localStore(),SAVED_TRAINING_KEY,{active:true,savedAt:new Date().toISOString(),session});
  }
}
function startFreshSession(){
  const previous=readActiveSession();
  if(previous?.firstSpotId){
    write(localStore(),LAST_SESSION_KEY,{
      id:previous.id,
      firstSpotId:previous.firstSpotId,
      lastSpotId:previous.lastSpotId,
      viewed:previous.viewed||0,
      endedAt:new Date().toISOString()
    });
  }
  const next=newSession();
  write(sessionStore(),SESSION_KEY,next);
  return next;
}
function saveTraining(){
  const session=readActiveSession();
  const saved={...session,savedTraining:true};
  writeActiveSession(saved);
  return progress();
}
function discardSavedTraining(){
  try{localStore()?.removeItem(SAVED_TRAINING_KEY)}catch(_){}
  const session=readActiveSession();
  const next={...session,savedTraining:false};
  write(sessionStore(),SESSION_KEY,next);
  return progress();
}
function hasSavedTraining(){
  const saved=parse(localStore(),SAVED_TRAINING_KEY,null);
  return !!(saved?.active&&saved?.session?.seen);
}

async function getJson(path){
  const attempts=[path];
  if(global.location?.hostname==='htmlpreview.github.io'){
    attempts.push('https://raw.githubusercontent.com/SkyareCom/stackup.holdem-heroes/main/'+path);
  }
  let last;
  for(const url of attempts){
    try{
      const res=await fetch(url,{cache:'force-cache'});
      if(res.ok)return await res.json();
      last=new Error('HTTP '+res.status+' for '+url);
    }catch(err){last=err}
  }
  throw last||new Error('unable to load solved spot bank');
}
function flatten(bank){
  const out=[];
  for(const spot of bank.spots||[]){
    for(const entry of spot.strategy||[]){
      out.push(Object.freeze({
        id:entry.solvedDecisionId,
        family:entry.family||'GENERAL',
        sourceBank:spot.sourceBank||null,
        spot:Object.freeze({...spot,strategy:[entry]}),
        entry
      }));
    }
  }
  return out;
}
async function loadStreet(street){
  const key=normalizeStreet(street);
  if(!key||!BANKS[key])throw new Error('invalid street bank: '+street);
  if(cache.has(key))return cache.get(key);
  const bank=await getJson(BANKS[key]);
  if(bank.mode!=='STRICT_SOLVED_ONLY')throw new Error('bank is not strict solved-only');
  const flat=flatten(bank);
  if(flat.length!==TOTALS[key])throw new Error('bank count mismatch for '+key+': '+flat.length);
  const value=Object.freeze({bank,flat});
  cache.set(key,value);
  return value;
}
function chooseStreet(seen){
  const weighted=[];
  let total=0;
  for(const [street,count] of Object.entries(TOTALS)){
    const remaining=Math.max(0,count-(seen[street]?.length||0));
    if(remaining>0){weighted.push([street,remaining]);total+=remaining}
  }
  if(!total)return null;
  let pick=randomInt(total);
  for(const [street,w] of weighted){
    if(pick<w)return street;
    pick-=w;
  }
  return weighted[weighted.length-1][0];
}
function progress(){
  const session=readActiveSession();
  const byStreet={};
  let viewed=0;
  for(const [street,total] of Object.entries(TOTALS)){
    const n=Math.min(total,session.seen?.[street]?.length||0);
    byStreet[street]={viewed:n,total,remaining:total-n};
    viewed+=n;
  }
  return Object.freeze({
    sessionId:session.id,
    savedTraining:!!session.savedTraining,
    viewed,
    total:Object.values(TOTALS).reduce((a,b)=>a+b,0),
    remaining:Object.values(TOTALS).reduce((a,b)=>a+b,0)-viewed,
    byStreet
  });
}
async function next(options){
  const opt=options||{};
  let session=readActiveSession();
  let street=normalizeStreet(opt.street)||chooseStreet(session.seen);

  if(!street){
    if(session.savedTraining)throw new Error('saved training sampling exhausted');
    session=startFreshSession();
    street=normalizeStreet(opt.street)||chooseStreet(session.seen);
  }

  const loaded=await loadStreet(street);
  const seenSet=new Set(session.seen[street]||[]);
  let pool=loaded.flat.filter(x=>!seenSet.has(x.id)&&(!opt.family||x.family===opt.family));

  if(!pool.length){
    if(opt.family)throw new Error('family exhausted: '+opt.family);
    if(session.savedTraining)throw new Error('saved training street exhausted: '+street);
    session.seen[street]=[];
    pool=loaded.flat;
  }

  // A fresh session must not restart with the exact same first spot as the previous session.
  if(!session.firstSpotId){
    const last=parse(localStore(),LAST_SESSION_KEY,null);
    if(last?.firstSpotId&&pool.length>1){
      const filtered=pool.filter(x=>x.id!==last.firstSpotId);
      if(filtered.length)pool=filtered;
    }
  }

  const item=pool[randomInt(pool.length)];
  session.seen[street].push(item.id);
  session.firstSpotId=session.firstSpotId||item.id;
  session.lastSpotId=item.id;
  session.viewed=(Number(session.viewed)||0)+1;
  writeActiveSession(session);

  const view=global.StackUpSpotsEngine?.toViewModel
    ?global.StackUpSpotsEngine.toViewModel(item.spot,{positions:item.spot.scenario?.positions||[]})
    :null;

  return Object.freeze({...item,street,view,progress:progress()});
}
function reset(){
  const next=startFreshSession();
  return Object.freeze({...progress(),sessionId:next.id});
}

// Starting a new browser/app session naturally creates a new sessionStorage sequence.
// A saved training is the only state restored from localStorage.
global.HeroesSolvedSpots=Object.freeze({
  VERSION:'1.1.0',
  BANKS,
  TOTALS,
  next,
  progress,
  reset,
  startFreshSession,
  saveTraining,
  discardSavedTraining,
  hasSavedTraining,
  loadStreet
});
})(window);
