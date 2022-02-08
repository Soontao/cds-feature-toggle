import { FeatureProvider, Features } from "./interface";


export class CDSRequestProvider implements FeatureProvider {

  getFeatures(context: any): Features {
    // TODO: add signature verify
    return context?._?.req?.headers?.["x-cds-features"]?.split(",") ?? [];
  }

}


export const providers = new Set<FeatureProvider>();

