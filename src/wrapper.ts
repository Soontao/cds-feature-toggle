// @ts-nocheck
import { CONTEXT_KEY_FEATURE_PROVIDER } from "./constants";
import { FeatureProviderContainer } from "./provider";
import { isFeatureInFeatures } from "./utils";

export interface WrapOption {
  /**
   * enabled condition, default is false
   */
  enabled?: Array<string> | string,
}

export const withFeature = (option: WrapOption) => <T extends Function>(handler: T): T => {

  // enabled direct, but why you use this wrap ?
  if (typeof option?.enabled === "string" || option?.enabled instanceof Array) {

    return async (...args) => {

      const container: FeatureProviderContainer = cds.context[CONTEXT_KEY_FEATURE_PROVIDER];

      const features = await container.getFeatures(cds.context);

      if ( isFeatureInFeatures(option.enabled, features)) {
        return handler(...args);
      }

      let nextFunction: Function = undefined;

      if (typeof args[args.length - 1] === "function") {
        nextFunction = args[args.length - 1];
      }

      return nextFunction?.call?.();
    };
  } else {
    throw new TypeError("for parameter 'option.enabled', must provide a string or string array as value");
  }

};
