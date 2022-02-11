export const ANNOTATE_KEY_CDS_FEATURE = "@cds.features";
export const ANNOTATE_KEY_ENABLED = "@cds.features.enabled";
export const ANNOTATE_KEY_REDIRECT_TARGET = "@cds.features.redirect.target";
export const CONTEXT_KEY_EVENT_REDIRECT = "__feature_redirect_def";
export const CONTEXT_KEY_FEATURE_PROVIDER = "__feature_provider";

export const EVENT_CRUD = ["CREATE", "READ", "UPDATE", "DELETE"];
export const EVENT_DRAFT = ["NEW", "EDIT", "PATCH", "SAVE"];
export const EVENT_HTTP = ["GET", "PUT", "POST", "PATCH", "DELETE"];
export const EVENT_ENTITY = [...EVENT_CRUD, ...EVENT_DRAFT, ...EVENT_HTTP ];
