import { HEADER_DISABLE_CDS_FT_CACHE, HEADER_X_CDS_FEATURES_NAME } from "../src/constants";

export const baseHeaders = {
  [HEADER_DISABLE_CDS_FT_CACHE]: "true",
};

export const baseConfig = {
  validateStatus: function (status: any) {
    return status >= 200 && status < 500;
  },
  headers: baseHeaders,
};

export const buildConfig = (...features: Array<string>) => {
  if (features?.length > 0) {
    return {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: features.join(",")
      }
    };
  }
  return baseConfig;
};
