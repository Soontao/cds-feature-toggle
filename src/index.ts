import { supportFeatureAnnotate } from "./annotate";
import { FeatureNotEnabledError } from "./errors";
import { featureMiddleware } from "./middlewares";
import { getFeatures, setFeatures } from "./storage";

export const features = {
  middleware: featureMiddleware,
  setFeatures,
  getFeatures,
  FeatureNotEnabledError,
  supportFeatureAnnotate
};


export default features;
