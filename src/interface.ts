import { FeatureProviderContainer } from "./provider";

export type Features = Array<string>

export interface FeatureProvider {

  /**
   * get feature list for context
   * 
   * @param context determine context
   */
  getFeatures(context: DetermineContext): Promise<Features>

}


/**
 * the determine context for extract features
 */
export interface DetermineContext {
  request: import("express").Request;
  user: any;
  /**
   * event
   */
  event: string;
  /**
   * cds def
   */
  target: any;
  tenant?: string;
  query: any;
  service: any;
  /**
   * feature provider containers
   */
  container: FeatureProviderContainer;
  logger: {
    trace: Function;
    debug: Function;
    info: Function;
    warn: Function;
    error: Function;
  }
}
