// @ts-nocheck
import { intersection } from "@newdash/newdash/intersection";
import { CONTEXT_KEY_FEATURE_PROVIDER } from "./constants";
import { FeatureProviderContainer } from "./provider";

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

      if (
        // or enabled by feature toggle list
        (option.enabled instanceof Array && intersection(option.enabled, features).length > 0) ||
        // or enabled by single feature toggle
        (typeof option.enabled === "string" && features.includes(option.enabled))
      ) {
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
