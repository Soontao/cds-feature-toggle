import { FeatureProviderContainer } from "./provider";

export type Features = Array<string>

export interface FeatureProvider {

  /**
   * cds context
   * 
   * @param context 
   */
  getFeatures(context: DetermineContext): Promise<Features>

}



export interface DetermineContext {
  request: import("express").Request;
  user: any;
  event: string;
  target: any;
  tenant?: string;
  query: any;
  service: any;
  /**
   * feature provider containers
   */
  container: FeatureProviderContainer
}
