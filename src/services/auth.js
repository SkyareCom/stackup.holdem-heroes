const SESSION_KEY = 'heroes.session';
const memory = new Map();

function storageGet(key){
  try {
    if (globalThis.localStorage) return globalThis.localStorage.getItem(key);
  } catch {}
  return memory.has(key) ? memory.get(key) : null;
}

function storageSet(key,value){
  memory.set(key,value);
  try { if (globalThis.localStorage) globalThis.localStorage.setItem(key,value); } catch {}
}

function storageDelete(key){
  memory.delete(key);
  try { if (globalThis.localStorage) globalThis.localStorage.removeItem(key); } catch {}
}

export function getSession(){
  const raw=storageGet(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setSession(session){
  storageSet(SESSION_KEY,JSON.stringify(session));
  return session;
}

export function clearSession(){
  storageDelete(SESSION_KEY);
}
