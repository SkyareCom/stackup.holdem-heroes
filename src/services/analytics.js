import { PRODUCT_ID } from '../config/product.js';

export function createEvent(name, properties = {}){
  return {
    name,
    ...properties,
    product: PRODUCT_ID,
    timestamp: new Date().toISOString()
  };
}

export function track(name, properties = {}, transport = null){
  const event=createEvent(name,properties);
  if (typeof transport === 'function') transport(event);
  return event;
}
