export const ANNOTATE_KEY_CDS_FEATURE = "@cds.features";
export const ANNOTATE_KEY_ENABLED = "@cds.features.required";
export const ANNOTATE_KEY_REDIRECT_TARGET = "@cds.features.redirect.target";
export const CONTEXT_KEY_EVENT_REDIRECT = "__feature_redirect_def";
export const CONTEXT_KEY_FEATURE_PROVIDER = "__feature_provider";
export const CONTEXT_KEY_FEATURE_DETERMINE_CONTEXT = "__feature_toggle_determine_context";

export const EVENT_CRUD = ["CREATE", "READ", "UPDATE", "DELETE"];
export const EVENT_DRAFT = ["NEW", "EDIT", "PATCH", "SAVE"];
export const EVENT_HTTP = ["GET", "PUT", "POST", "PATCH", "DELETE"];
export const EVENT_ENTITY = [...EVENT_CRUD, ...EVENT_DRAFT, ...EVENT_HTTP];

export const HEADER_DISABLE_CDS_FT_CACHE = "x-cds-feature-toggle-disable-cache";
export const HEADER_X_CDS_FEATURES_NAME = "x-cds-features";
