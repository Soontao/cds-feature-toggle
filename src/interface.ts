import { FeatureProviderContainer } from "./provider";

export type Features = Array<string>

export interface FeatureProvider {

  /**
   * cds context
   * 
   * @param context 
   */
  getFeatures(context: any): Promise<Features>

}



export interface DetermineContext {
  cdsContext: any
  cdsService: any
  featureProviderContainer: FeatureProviderContainer
}
