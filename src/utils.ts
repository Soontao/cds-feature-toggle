

import { find } from "@newdash/newdash/find";
import { intersection } from "@newdash/newdash/intersection";
import {
  ANNOTATE_KEY_CDS_FEATURE,
  ANNOTATE_KEY_ENABLED,
  ANNOTATE_KEY_REDIRECT_TARGET
} from "./constants";
import { DetermineContext } from "./interface";

const annotateKeys = [ANNOTATE_KEY_CDS_FEATURE, ANNOTATE_KEY_ENABLED, ANNOTATE_KEY_REDIRECT_TARGET];

export const getDef = (context: DetermineContext) => {
  if (context?.target !== undefined && context?.target?.kind === "entity") {
    if ("actions" in context?.target && context.event in context.target?.actions) {
      // bounded action/function
      return context.target?.actions[context.event];
    }
    // raw entity
    return context?.target;
  }
  // unbounded action/function
  return context.service.operations[context.event];
};

/**
 * with any feature related annotations
 * 
 * @param context 
 * @returns 
 */
export const isFeatureRelatedDef = (context: DetermineContext) => {
  const op = getDef(context);
  for (const annotateKey of annotateKeys) {
    if (annotateKey in op) {
      return true;
    }
  }
  if (ANNOTATE_KEY_ENABLED in context.service.definition) {
    return true;
  }
  return false;
};

export const isFeatureInFeatures = (requiredFeatures: string | Array<string>, allFeatures: Array<string>) => {

  if (allFeatures !== undefined && allFeatures.length > 0) {
    // contains any features
    if (requiredFeatures instanceof Array) {
      if (intersection(requiredFeatures, allFeatures).length > 0) {
        return true;
      }
    }

    // contains the feature
    if (typeof requiredFeatures === "string") {
      if (allFeatures?.includes?.(requiredFeatures)) {
        return true;
      }
    }
  }

  return false;
};


export const isEnabled = async (context: DetermineContext) => {

  const def = getDef(context);

  if (def === undefined) {
    context.logger.error(
      "could not get correct event def for feature toggle"
    );
    return false;
  }

  /**
   * current request/user/tenant enabled feature list
   */
  let currentContextFeatures = undefined;

  // check in service level
  if (ANNOTATE_KEY_ENABLED in context?.service?.definition) {
    currentContextFeatures = await context.container.getFeatures(context);
    const requiredFeatures = context?.service?.definition[ANNOTATE_KEY_ENABLED];
    if (!isFeatureInFeatures(requiredFeatures, currentContextFeatures)) {
      context.logger.debug(
        "required feature", requiredFeatures,
        "context features", currentContextFeatures,
        "not match"
      );
      return false;
    }
  }

  /**
   * current event required feature labels
   */
  let eventRequestedFeatureLabels = undefined;

  if (def.kind === "entity" && ANNOTATE_KEY_CDS_FEATURE in def && def[ANNOTATE_KEY_CDS_FEATURE] instanceof Array) {
    const eventFeature: any = find(def[ANNOTATE_KEY_CDS_FEATURE], { on: context.event });
    eventRequestedFeatureLabels = eventFeature?.required;
  } else {
    eventRequestedFeatureLabels = def[ANNOTATE_KEY_ENABLED];
  }

  // no annotation, means no feature required
  if (eventRequestedFeatureLabels === undefined) {
    return true;
  }

  if (currentContextFeatures === undefined) {
    currentContextFeatures = await context.container.getFeatures(context);
  }

  if (isFeatureInFeatures(eventRequestedFeatureLabels, currentContextFeatures)) {
    return true;
  }

  return false;

};

export const getRedirect = async (context: DetermineContext): Promise<any> => {

  const op = getDef(context);

  if (op[ANNOTATE_KEY_REDIRECT_TARGET] !== undefined) {

    for (const target of op[ANNOTATE_KEY_REDIRECT_TARGET]) {
      const targetEventName = target["="];
      // TODO: check the redirect target is existed or not
      const targetEvent = context.service.operations[targetEventName];
      const targetContext = { ...context, event: targetEventName };
      if (await isEnabled(targetContext)) {
        return targetEvent;
      }
      const redirect = await getRedirect(targetContext);
      if (redirect !== undefined) {
        return redirect;
      }
    }
  }

};

export interface FeatureCheckResult {
  /**
   * is feature relevant
   */
  featureRelevant: boolean;
  enabled: boolean;
  /**
   * redirect target
   */
  redirect?: any;
  /**
   * req/user/context all features
   */
  features: Array<string>;
}

export const checkFeatureEnabled = async (context: DetermineContext): Promise<FeatureCheckResult> => {
  // TODO: check service is enabled
  // TODO: check entity is enabled
  const featureRelevant = isFeatureRelatedDef(context);

  if (!featureRelevant) {
    return {
      featureRelevant, redirect: undefined, enabled: true, features: []
    };
  }

  const features = await context.container.getFeatures(context);
  const redirect = await getRedirect(context);

  if (redirect !== undefined) {
    return {
      featureRelevant, redirect, enabled: true, features
    };
  }

  const enabled = await isEnabled(context);

  return {
    featureRelevant, redirect, enabled, features
  };

};
