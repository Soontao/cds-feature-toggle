/* eslint-disable camelcase */

import { intersection } from "@newdash/newdash/intersection";
import { getFeatures } from "./storage";

const isEnabled = (evtName: string, srv: any) => {

  const op = srv.operations[evtName];

  if (op === undefined) {
    // error
    return false;
  }

  const enabledAnnotationValue = op["@cds.features.enabled"];

  // contains any features
  if (enabledAnnotationValue instanceof Array) {
    if (intersection(enabledAnnotationValue, getFeatures()).length > 0) {
      return true;
    }
  }

  if (typeof enabledAnnotationValue === "string") {
    if (getFeatures()?.includes?.(enabledAnnotationValue)) {
      return true;
    }
  }

  // default enabled
  if (op["@cds.features.enabled"] === true) {
    return true;
  }

  return false;

};

const getRedirect = (evtName: string, srv: any): any => {

  const op = srv.operations[evtName];

  if (op["@cds.features.redirect.target"] !== undefined) {
    for (const target of op["@cds.features.redirect.target"]) {
      const targetEventName = target["="];
      const targetEvent = srv.operations[targetEventName];
      if (isEnabled(targetEventName, srv)) {
        return targetEvent;
      }
      const redirect = getRedirect(targetEventName, srv);
      if (redirect !== undefined) {
        return redirect;
      }
    }
  }
};

export const supportFeatureAnnotate = (cds: any) => {

  cds.on("serving", (service: any) => {

    if (service instanceof cds.ApplicationService) {

      const logger = cds.log(service?.name);

      service.prepend("*", (srv: any) => {

        srv.before("*", async (evt: any) => {
          
          const redirect = getRedirect(evt.event, srv);

          if (redirect !== undefined) {
            evt._feature_redirect = redirect;
          }

          if (isEnabled(evt.event, srv)) {
            return;
          }

          throw new Error(`${evt?.event} is not enabled`);

        });

        srv.on("*", async (evt: any, next: Function) => {

          if (evt._feature_redirect !== undefined) {
            const event = evt._feature_redirect.name.match(/\w*$/)[0];
            logger.info(`redirect event from ${evt.event} to ${event}`);
            return srv[event]({ ...evt, event });
          }
          // please carefully process error happens here
          logger.info(`before ${evt?.event} ${evt?.target?.name || ""}`);
          const rt = await next();
          logger.info(`after ${evt?.event} ${evt?.target?.name || ""}`);
          return rt;
        });

      });
    }
  });

};
