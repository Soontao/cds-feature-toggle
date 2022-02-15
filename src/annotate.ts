/* eslint-disable camelcase */

import {
  CONTEXT_KEY_EVENT_REDIRECT, CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT
} from "./constants";
import { FeatureNotEnabledError } from "./errors";
import { DetermineContext, FeatureProvider } from "./interface";
import { FeatureProviderContainer } from "./provider";
import { checkFeatureEnabled } from "./utils";



export const supportFeatureAnnotate = (cds: any, ...providers: Array<FeatureProvider>) => {

  const container = new FeatureProviderContainer(...providers);

  cds.on("serving", (service: any) => {

    if (service instanceof cds.ApplicationService) { // only application services

      const logger = cds.log(service?.name);

      // add events before all
      service.prepend("*", (srv: any) => {

        srv.before("*", async (evt: any) => {

          const context: DetermineContext = {
            request: cds?.context?._?.req,
            event: evt?.event,
            target: evt?.target,
            query: evt?.query,
            user: cds?.user,
            service: srv,
            tenant: evt?.tenant,
            container: container,
            logger,
          };

          evt[CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT] = context;

          const checkResult = await checkFeatureEnabled(context);

          // if the event is not annotated with @cds.feature
          if (!checkResult.featureRelevant) {
            return; // do nothing
          }

          if (checkResult.redirect !== undefined) {
            evt[CONTEXT_KEY_EVENT_REDIRECT] = checkResult.redirect;
          }

          if (checkResult.enabled) {
            return;
          }

          const errMessage = `${evt?.entity ?? srv?.name}/${evt?.event} is not enabled`;

          if (evt.reject) { // request
            evt.reject(400, errMessage);
          } else { // event
            throw new FeatureNotEnabledError(errMessage);
          }

        });

        srv.on("*", async (evt: any, next: Function) => {

          if (CONTEXT_KEY_EVENT_REDIRECT in evt && typeof evt[CONTEXT_KEY_EVENT_REDIRECT] === "object") {
            const event = evt[CONTEXT_KEY_EVENT_REDIRECT].name.match(/\w*$/)[0];
            logger.debug(`redirect event from ${evt.event} to ${event}`);
            return srv.send(event, evt.data);
          }

          return await next();
        });

      });
    }
  });

};
