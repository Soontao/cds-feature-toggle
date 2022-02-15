// @ts-nocheck
import { CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT } from "./constants";
import { DetermineContext } from "./interface";
import { isFeatureInFeatures } from "./utils";

export interface WrapOption {
  /**
   * enabled condition, default is false
   */
  enabled: Array<string> | string,
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
 * @param option 
 * @returns EventHandler function
 */
export const withFeature = (option: WrapOption) => <T extends Function>(handler: T): T => {

  // TODO: assert handler is a function

  // enabled direct, but why you use this wrap ?
  if (typeof option?.enabled === "string" || option?.enabled instanceof Array) {

    return async (...args) => {
      
      const evt = cds.context;
      const context: DetermineContext = evt[CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT];
      const srv = context.service;

      if (context !== undefined) {

        const features = await context.container.getFeatures(context);

        if (isFeatureInFeatures(option.enabled, features)) {
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
