import { ApplicationService, Definition, Logger, User } from "cds-internal-tool";
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
  /**
   * http incoming request
   */
  request: import("express").Request;
  /**
   * user information
   */
  user: User;
  /**
   * event name
   */
  event: string;
  /**
   * cds def
   */
  target: Definition;
  /**
   * tenant id, could be undefined
   */
  tenant?: string;
  query: any;
  service: ApplicationService;
  /**
   * feature provider containers
   */
  container: FeatureProviderContainer;
  logger: Logger;
}
