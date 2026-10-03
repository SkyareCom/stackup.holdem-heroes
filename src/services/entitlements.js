import { PLANS } from '../config/product.js';

const tiers=new Set(Object.values(PLANS));

export function normalizeTier(tier){
  const normalized=String(tier||'').toLowerCase();
  return tiers.has(normalized) ? normalized : PLANS.FREE;
}

export function canUsePaidFeatures(tier){
  const normalized=normalizeTier(tier);
  return normalized===PLANS.EDGE || normalized===PLANS.FULL;
}

export function isFull(tier){
  return normalizeTier(tier)===PLANS.FULL;
}
