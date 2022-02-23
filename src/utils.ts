

import { find } from "@newdash/newdash/find";
import { intersection } from "@newdash/newdash/intersection";
import { isEmpty } from "@newdash/newdash/isEmpty";
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
  if (op !== undefined) {
    for (const annotateKey of annotateKeys) {
      if (annotateKey in op) {
        return true;
      }
    }
    if (ANNOTATE_KEY_ENABLED in context.service.definition) {
      return true;
    }
  }
  return false;
};

/**
 * 
 * @param requiredFeatures 
 * @param allFeatures 
 * @returns 
 */
export const isFeatureInFeatures = (requiredFeatures: string | Array<string>, allFeatures: Array<string>) => {
  if (isEmpty(requiredFeatures)) {
    return false;
  }
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
  let currentContextFeatures: any = undefined;

  /**
   * refresh context features on demand
   */
  const refreshContextFeatures = async () => {
    if (currentContextFeatures === undefined) {
      currentContextFeatures = await context.container.getFeatures(context);
    }
  };

  // check in service level
  if (ANNOTATE_KEY_ENABLED in context?.service?.definition) {
    await refreshContextFeatures();
    const requiredFeatures = context?.service?.definition[ANNOTATE_KEY_ENABLED];
    if (!isEmpty(requiredFeatures)) {
      if (!isFeatureInFeatures(requiredFeatures, currentContextFeatures)) {
        context.logger.debug(
          "service", context.service.name,
          "required feature", requiredFeatures,
          "context features", currentContextFeatures,
          "not match"
        );
        return false;
      }
    }
  }

  // check in entity level
  if (ANNOTATE_KEY_ENABLED in def && def.kind === "entity") {
    await refreshContextFeatures();
    const requiredFeatures = def[ANNOTATE_KEY_ENABLED];
    if (!isEmpty(requiredFeatures)) {
      if (!isFeatureInFeatures(requiredFeatures, currentContextFeatures)) {
        context.logger.debug(
          "entity", def.name,
          "required feature", requiredFeatures,
          "context features", currentContextFeatures,
          "not match"
        );
        return false;
      }
    }
  }

  /**
   * current event required feature labels
   */
  let eventRequestedFeatureLabels = undefined;

  if (def.kind === "entity" && ANNOTATE_KEY_CDS_FEATURE in def && def[ANNOTATE_KEY_CDS_FEATURE] instanceof Array) {
    // for @cds.features: [{on:event,required:[]}]
    const eventFeature: any = find(def[ANNOTATE_KEY_CDS_FEATURE], { on: context.event });
    eventRequestedFeatureLabels = eventFeature?.required;
  } else {
    eventRequestedFeatureLabels = def[ANNOTATE_KEY_ENABLED];
  }

  if (!isEmpty(eventRequestedFeatureLabels)) {
    await refreshContextFeatures();
    if (!isFeatureInFeatures(eventRequestedFeatureLabels, currentContextFeatures)) {
      context.logger.debug(
        "service", context.service.name,
        "event", context.event,
        "required feature", eventRequestedFeatureLabels,
        "context features", currentContextFeatures,
        "not match"
      );
      return false;
    }
  }

  return true;

};

export const getRedirect = async (context: DetermineContext): Promise<any> => {

  const op = getDef(context);

  if (op[ANNOTATE_KEY_REDIRECT_TARGET] !== undefined) {

    for (const target of op[ANNOTATE_KEY_REDIRECT_TARGET]) {
      const targetEventName = target["="];
      // TODO: check the redirect target is existed or not
      const targetEvent = context.service.operations[targetEventName] ?? op?.parent?.actions?.[targetEventName];
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
