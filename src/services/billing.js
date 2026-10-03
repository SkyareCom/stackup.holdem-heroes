import { PLANS, STORE_PRODUCTS } from '../config/product.js';

export function getStoreProductId(tier){
  const normalized=String(tier||'').toLowerCase();
  if (normalized===PLANS.EDGE) return STORE_PRODUCTS.EDGE;
  if (normalized===PLANS.FULL) return STORE_PRODUCTS.FULL;
  return null;
}

export function acceptsLocalEntitlementGrant(){
  return false;
}

export function requiresServerVerification(){
  return true;
}
