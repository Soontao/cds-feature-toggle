import { AsyncLocalStorage } from "async_hooks";

export const featureLocalStorage = new AsyncLocalStorage<Array<string>>();

export const setFeatures = (features: []) => {
  featureLocalStorage.enterWith(features);
};

export const getFeatures = (): Array<string> => {
  return featureLocalStorage.getStore() as Array<string> ?? [];
};
