import { supportFeatureAnnotate } from "./annotate";
import { FeatureNotEnabledError } from "./errors";
import { CDSRequestProvider, FeatureProviderContainer } from "./provider";
export { FeatureProvider, Features } from "./interface";

export const providers = {
  CDSRequestProvider
};

export const features = {
  FeatureNotEnabledError,
  supportFeatureAnnotate,
  FeatureProviderContainer,
  providers
};


export default features;
