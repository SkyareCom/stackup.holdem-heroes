import { PRODUCT_ID, PLANS, STORE_PRODUCTS } from '../src/config/product.js';
import { getSession, setSession, clearSession } from '../src/services/auth.js';
import { createEvent } from '../src/services/analytics.js';
import { getStoreProductId, acceptsLocalEntitlementGrant } from '../src/services/billing.js';
import { normalizeTier, canUsePaidFeatures } from '../src/services/entitlements.js';

const failures=[];
const expect=(c,m)=>{if(!c)failures.push(m)};

expect(PRODUCT_ID==='heroes','product identity mismatch');
expect(typeof getSession==='function' && typeof setSession==='function' && typeof clearSession==='function','auth session interface missing');

const evt=createEvent('app_open',{platform:'web'});
expect(evt.name==='app_open','analytics event name missing');
expect(evt.product==='heroes','analytics must inject product=heroes');
expect(evt.platform==='web','analytics properties must be preserved');

expect(getStoreProductId('edge')===STORE_PRODUCTS.EDGE,'EDGE billing product mismatch');
expect(getStoreProductId('full')===STORE_PRODUCTS.FULL,'FULL billing product mismatch');
expect(acceptsLocalEntitlementGrant()===false,'client billing must never grant entitlements locally');

expect(normalizeTier('FREE')===PLANS.FREE,'FREE tier normalization failed');
expect(normalizeTier('edge')===PLANS.EDGE,'EDGE tier normalization failed');
expect(normalizeTier('FULL')===PLANS.FULL,'FULL tier normalization failed');
expect(canUsePaidFeatures(PLANS.FREE)===false,'FREE must not be treated as paid');
expect(canUsePaidFeatures(PLANS.EDGE)===true,'EDGE must be treated as paid');
expect(canUsePaidFeatures(PLANS.FULL)===true,'FULL must be treated as paid');

if(failures.length){
  console.error('Service validation failed:');
  failures.forEach(f=>console.error('- '+f));
  process.exit(1);
}
console.log('Service validation passed.');
