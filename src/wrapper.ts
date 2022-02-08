// @ts-nocheck
import { intersection } from "@newdash/newdash/intersection";
import { getFeatures } from "./storage";

export interface WrapOption {
  /**
   * enabled condition, default is false
   */
  enabled?: boolean | Array<string>,
  /**
   * feature redirect target 
   */
  redirectTarget: Array<string>,
}

export const onFeature = (option: WrapOption) => <T>(handler: T): T => {
  
  return (...args) => {
    let nextFunction: Function = undefined;

    if (typeof args[args.length - 1] === "function") {
      nextFunction = args[args.length - 1];
    }

    if (
      // enabled direct
      option.enabled === true ||
      // or enabled by feature toggle
      (
        option.enabled instanceof Array
        && intersection(option.enabled, getFeatures()).length > 0
      )
    ) {
      return handler(...args);
    }

    return nextFunction?.call?.();
  };
};
