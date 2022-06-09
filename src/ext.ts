// @ts-nocheck

import HyperAppService from "cds-hyper-app-service";
import { cdsProjectRequire, cwdRequireCDS, Logger } from "cds-internal-tool";
import { CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT } from "./constants";
import { FeatureNotEnabledError } from "./errors";
import { DetermineContext } from "./interface";
import { CDSRequestProvider, FeatureProviderContainer } from "./provider";
import { checkFeatureEnabled } from "./utils";


export class RateLimitExt extends HyperAppService.ApplicationServiceExt<{ providers?: Array<string> }> {


  private container: FeatureProviderContainer;

  private logger: Logger;

  constructor(srv, options) {
    super(srv, options);
    const cds = cwdRequireCDS();
    const providers = [];

    for (const providerName of (this.options.providers ?? [CDSRequestProvider.name])) {
      if (providerName === CDSRequestProvider.name) {
        providers.push(new CDSRequestProvider());
      }
      else {
        const m = cdsProjectRequire(providerName);
        providers.push(new m()); // TODO: check provide function is available
      }
    }

    this.container = new FeatureProviderContainer(...providers);
    this.logger = cds.log("feature");

  }

  private createHandler() {
    const container = this.container;
    const logger = this.logger;
    
    return async function (evt) {

      const srv = this;

      const context: DetermineContext = {
        request: evt?._?.req,
        event: evt?.event,
        target: evt?.target,
        query: evt?.query,
        user: evt?.user,
        tenant: evt?.tenant,
        service: this,
        container,
        logger,
      };

      evt[CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT] = context;

      const checkResult = await checkFeatureEnabled(context);

      // if the event is not annotated with @cds.feature
      if (!checkResult.featureRelevant) {
        return; // do nothing
      }

      if (checkResult.redirect !== undefined) {
        const redirectTarget = checkResult.redirect;

        const event = redirectTarget.name.match(/\w*$/)[0];

        // bounded
        if (redirectTarget?.parent?.kind === "entity") {
          logger.debug(`redirect event from ${redirectTarget?.parent?.name}/${evt.event} to ${event}`);
        }

        // unbound
        else {
          logger.debug(`redirect event from ${evt.event} to ${event}`);
        }

        evt.event = event;

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

    };
  }

  async beforeInit(): void | Promise<void> {
    this.srv.before("*", this.createHandler());
  }

}
