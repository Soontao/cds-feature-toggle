import { supportFeatureAnnotate } from "./annotate";
import { FeatureNotEnabledError } from "./errors";
import { CDSRequestProvider, FeatureProviderContainer } from "./provider";
import { withFeature } from "./wrapper";
export { FeatureProvider, Features } from "./interface";

export const providers = {
  CDSRequestProvider
};

export const features = {
  FeatureNotEnabledError,
  FeatureProviderContainer,
  CDSRequestProvider,
  withFeature,
  supportFeatureAnnotate,
};


export default features;
