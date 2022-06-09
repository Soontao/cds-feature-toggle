// @ts-nocheck

import { ApplicationServiceExt } from "cds-hyper-app-service";
import { ApplicationService, cdsProjectRequire, cwdRequireCDS, Logger } from "cds-internal-tool";
import { CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT } from "./constants";
import { FeatureNotEnabledError } from "./errors";
import { DetermineContext } from "./interface";
import { builtInProviders, CDSRequestProvider, FeatureProviderContainer } from "./provider";
import { checkFeatureEnabled } from "./utils";

/**
 * hyper app service extension for feature toggle
 */
export class FeatureToggleExt extends ApplicationServiceExt<{ providers?: Array<string>, cacheTtl?: number }> {


  private container: FeatureProviderContainer;

  private logger: Logger;

  constructor(options: { providers?: Array<string>, cacheTtl?: number }) {
    super(options);

    const providers = [];

    for (const providerName of (options?.providers ?? [CDSRequestProvider.name])) {
      const FeatureProvider = builtInProviders.find(provider => provider.name === providerName);
      if (FeatureProvider !== undefined) {
        providers.push(new FeatureProvider());
      }
      else {
        const m = cdsProjectRequire(providerName);
        providers.push(new m()); // TODO: check provide function is available
      }
    }

    this.container = new FeatureProviderContainer({
      providers,
      cacheTtl: options?.cacheTtl
    });

    this.logger = cwdRequireCDS().log("feature");

  }

  public async beforeInit(srv: ApplicationService): void | Promise<void> {
    srv.before("*", this._createHandler(this.container, this.logger));
  }


  private _createHandler(container, logger) {

    /**
     * feature toggle handler for attach context and reject request if feature not enabled
     */
    return async function featureToggleHandler(evt) {

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

}
