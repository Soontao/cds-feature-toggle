import { AsyncLocalStorage } from "async_hooks";

export const featureLocalStorage = new AsyncLocalStorage<Array<string>>();

/**
 * set feature list in some async operations, like message queue or job
 * 
 * @param features 
 */
export const setFeatures = (features: Array<string> = []) => {
  if (!(features instanceof Array)) {
    throw new TypeError(`must provide an array as feature list`);
  }
  featureLocalStorage.enterWith(features);
};

/**
 * get features with context
 * 
 * @returns 
 */
export const getFeatures = (): Array<string> => {
  return featureLocalStorage.getStore() as Array<string> ?? [];
};
