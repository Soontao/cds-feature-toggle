// @ts-nocheck
import { CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT } from "./constants";
import { DetermineContext } from "./interface";
import { isFeatureInFeatures } from "./utils";

export interface WrapOption {
  /**
   * required feature(s) for inner function, if give multi-features, any of one is matched is enabled
   */
  required: Array<string> | string,
  /**
   * no reject error when the feature is not enabled
   * if you register multi event handler for single action/function, it could be used
   * 
   * @default false
   */
  noReject?: boolean;
}

/**
 * wrap a handler with feature check
 * 
 * @param option option of wrap
 * @returns the function wrapper for handler
 * 
 * @example 
 * 
 * ```ts
 * srv.on("freeAction002", withFeature({ required: ["feat-action-001", "feat-action-002"] })(() => {
 *  return { "service": "CDS", name: "freeAction001" };
 * }));
 * ```
 */
export const withFeature = (option: WrapOption) => <T extends Function>(handler: T): T => {

  if (typeof handler !== "function") {
    throw new TypeError("for withFeature function, require an (async) function as parameter");
  }

  if (typeof option?.required === "string" || option?.required instanceof Array) {

    return async (...args) => {

      const evt = cds.context;
      const context: DetermineContext = evt[CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT];
      const srv = context.service;

      if (context !== undefined) {

        const features = await context.container.getFeatures(context);

        if (isFeatureInFeatures(option.required, features)) {
          return handler(...args);
        }

        if (option.noReject !== true) {
          const errMessage = `${evt?.entity ?? srv?.name}/${evt?.event} is not enabled`;

          if (evt.reject) { // request
            evt.reject(400, errMessage);
          } else { // event
            throw new FeatureNotEnabledError(errMessage);
          }
        }

      }

      let nextFunction: Function = undefined;

      if (typeof args[args.length - 1] === "function" && args[args.length - 1]?.name === "next") {
        nextFunction = args[args.length - 1];
      }

      return nextFunction?.call?.();
    };
  } else {
  }

};
