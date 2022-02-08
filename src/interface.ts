
export type Features = Array<string>

export interface FeatureProvider {
  getFeatures(context: any): Features
}

