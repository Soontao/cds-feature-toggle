import { MutexMap } from "@newdash/newdash/functional/MutexMap";
import { TTLMap } from "@newdash/newdash/functional/TTLMap";
import { HEADER_DISABLE_CDS_FT_CACHE, HEADER_X_CDS_FEATURES_NAME } from "./constants";
import { DetermineContext, FeatureProvider, Features } from "./interface";


/**
 * Dummy Feature Provider for test
 */
export class DummyProvider implements FeatureProvider {

  private features: Features = [];

  constructor(options: { features: Features }) {
    this.features = options?.features ?? [];
  }

  async getFeatures(): Promise<Features> {
    return this.features;
  }

}

/**
 * the minimal provider which just extract `features` from HTTP header without verification.
 * 
 * it maybe **DANGEROUS** if the CAP service is public
 */
export class CDSRequestProvider implements FeatureProvider {

  #headerName = HEADER_X_CDS_FEATURES_NAME;

  /**
   * extract http header as (enabled) feature list for current request
   * 
   * @param options.header default is `x-cds-features`
   */
  constructor(options: { header?: string }) {
    if (typeof options?.header === "string") {
      this.#headerName = options?.header;
    }
  }

  public getFeatures(context: DetermineContext) {
    // TODO: add signature verify
    return Promise.resolve(context?.request?.get?.(this.#headerName)?.split(",") ?? []);
  }

}

export class FeatureProviderContainer {

  #providers: Set<FeatureProvider> = new Set();

  #locks = new MutexMap();

  #cache = new TTLMap(1000); // default 1 second cache

  /**
   * FeatureProviderContainer
   * 
   * @param options options for container
   */
  constructor(options: { providers: Array<FeatureProvider>, cacheTtl: number }) {
    if (options?.providers.length > 0) {
      this.#providers = new Set(options.providers);
    }
    if (typeof options?.cacheTtl === "number" && options.cacheTtl > 0) {
      this.#cache = new TTLMap(options.cacheTtl);
    }
  }

  public registerProvider(provider: FeatureProvider) {
    if (provider !== undefined && provider !== null) {
      this.#providers.add(provider);
    }
  }

  #formatKey(context: DetermineContext) {
    // use 'request id' and 'user id' as cache key
    return JSON.stringify({
      user: context?.user?.id ?? "unknown",
      tenant: context?.tenant ?? "unknown"
    });
  }

  /**
   * get features list
   * 
   * @param context cds context
   * @param force get feature without cache
   * @returns 
   */
  public async getFeatures(context: DetermineContext, force: boolean = false): Promise<Features> {
    const key = this.#formatKey(context);
    return this.#locks
      .getOrCreate(key)
      .use(async () => {
        if (force || HEADER_DISABLE_CDS_FT_CACHE in (context.request?.headers ?? {}) || !this.#cache.has(key)) {
          const allFeaturesSet = new Set<string>();
          const featuresList = await Promise.allSettled(
            Array
              .from(this.#providers)
              .map(provider => provider.getFeatures(context))
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
          this.#cache.set(key, Array.from(allFeaturesSet));
        }
        return this.#cache.get(key);
      });

  }

}

export const builtInProviders = [DummyProvider, CDSRequestProvider];
