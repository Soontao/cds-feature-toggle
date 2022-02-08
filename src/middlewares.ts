import { featureLocalStorage } from "./storage";

/**
 * features middleware for express 
 * 
 * @param req 
 * @returns 
 */
export function featureMiddleware(req: import("express").Request) {
  featureLocalStorage.enterWith([]);
  return req?.next?.();
}
