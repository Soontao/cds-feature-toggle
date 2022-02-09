/* eslint-disable camelcase */

import { intersection } from "@newdash/newdash/intersection";
import {
  ANNOTATE_KEY_ENABLED,
  ANNOTATE_KEY_REDIRECT_TARGET,
  CONTEXT_KEY_EVENT_REDIRECT,
  CONTEXT_KEY_FEATURE_PROVIDER
} from "./constants";
import { FeatureNotEnabledError } from "./errors";
import { DetermineContext, FeatureProvider } from "./interface";
import { FeatureProviderContainer } from "./provider";



const annotateKeys = [ANNOTATE_KEY_ENABLED, ANNOTATE_KEY_REDIRECT_TARGET];

const isFeatureRelatedDef = (context: DetermineContext) => {
  const op = context.cdsService.operations[context.cdsContext.event];
  for (const annotateKey of annotateKeys) {
    if (annotateKey in op) {
      return true;
    }
  }
  return false;
};

const isEnabled = async (context: DetermineContext) => {

  const op = context.cdsService.operations[context.cdsContext.event];

  if (op === undefined) {
    // error
    return false;
  }

  const enabledAnnotationValue = op[ANNOTATE_KEY_ENABLED];

  const currentContextFeatures = await context.featureProviderContainer.getFeatures(context.cdsContext);

  if (currentContextFeatures !== undefined && currentContextFeatures.length > 0) {
    // contains any features
    if (enabledAnnotationValue instanceof Array) {
      if (intersection(enabledAnnotationValue, currentContextFeatures).length > 0) {
        return true;
      }
    }

    // contains the feature
    if (typeof enabledAnnotationValue === "string") {
      if (currentContextFeatures?.includes?.(enabledAnnotationValue)) {
        return true;
      }
    }

  }

  // default enabled
  if (op[ANNOTATE_KEY_ENABLED] === true) {
    return true;
  }

  return false;

};

const getRedirect = async (context: DetermineContext): Promise<any> => {

  const op = context.cdsService.operations[context.cdsContext.event];

  if (op[ANNOTATE_KEY_REDIRECT_TARGET] !== undefined) {

    for (const target of op[ANNOTATE_KEY_REDIRECT_TARGET]) {
      const targetEventName = target["="];
      const targetEvent = context.cdsService.operations[targetEventName];
      const targetContext = { ...context, cdsContext: { ...context.cdsContext, event: targetEventName } };
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
  featureRelevant: boolean
  enabled: boolean
  redirect?: any,
  features: Array<string>,
}

export const checkFeatureEnabled = async (context: DetermineContext): Promise<FeatureCheckResult> => {
  const featureRelevant = isFeatureRelatedDef(context);
  const features = await context.featureProviderContainer.getFeatures(context.cdsContext);
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

export const supportFeatureAnnotate = (cds: any, ...providers: Array<FeatureProvider>) => {

  const container = new FeatureProviderContainer(...providers);

  cds.on("serving", (service: any) => {

    if (service instanceof cds.ApplicationService) { // only application services

      const logger = cds.log(service?.name);

      // add events before all
      service.prepend("*", (srv: any) => {

        srv.before("*", async (evt: any) => {

          const context: DetermineContext = {
            cdsContext: evt,
            cdsService: srv,
            featureProviderContainer: container
          };
          
          evt[CONTEXT_KEY_FEATURE_PROVIDER] = container;

          const checkResult = await checkFeatureEnabled(context);

          // if the event is not annotated with @cds.feature
          if (!checkResult.featureRelevant) {
            return; // do nothing
          }

          if (checkResult.redirect !== undefined) {
            evt[CONTEXT_KEY_EVENT_REDIRECT] = checkResult.redirect;
          }

          if (checkResult.enabled === true) {
            return;
          }

          throw new FeatureNotEnabledError(`${evt?.event} is not enabled`);

        });

        srv.on("*", async (evt: any, next: Function) => {

          if (evt[CONTEXT_KEY_EVENT_REDIRECT] !== undefined) {
            const event = evt[CONTEXT_KEY_EVENT_REDIRECT].name.match(/\w*$/)[0];
            logger.debug(`redirect event from ${evt.event} to ${event}`);
            return srv[event]({ ...evt, event });
          }

          return await next();
        });

      });
    }
  });

};
