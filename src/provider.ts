import { FeatureProvider, Features } from "./interface";


export class CDSRequestProvider implements FeatureProvider {

  #headerName = "x-cds-features";

  /**
   * extract http header as (enabled) feature list for current request
   * 
   * @param featureHeaderName 
   */
  constructor(featureHeaderName?: string) {
    if (featureHeaderName !== undefined) {
      this.#headerName = featureHeaderName;
    }
  }

  public getFeatures(context: any) {
    // TODO: add signature verify
    return Promise.resolve(context?._?.req?.headers?.[this.#headerName]?.split(",") ?? []);
  }

}

export class FeatureProviderContainer {
  #providers: Set<FeatureProvider> = new Set();

  constructor(...providers: Array<FeatureProvider>) {
    if (providers.length > 0) {
      this.#providers = new Set(providers);
    }
  }

  public registerProvider(provider: FeatureProvider) {
    if (provider !== undefined && provider !== null) {
      this.#providers.add(provider);
    }
  }

  public async getFeatures(context: any): Promise<Features> {
    const allFeaturesSet = new Set<string>();
    const featuresList = await Promise.allSettled(
      Array.from(this.#providers).map(provider => provider.getFeatures(context))
    );
    for (const features of featuresList) {
      if (features.status === "fulfilled") {
        for (const feature of features.value) {
          allFeaturesSet.add(feature);
        }
      } else {
        // TODO: error log
      }
    }

    return Array.from(allFeaturesSet);
  }

}
