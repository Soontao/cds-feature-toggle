const cds = require("@sap/cds");
const { features, providers } = require("../../../src");

features.supportFeatureAnnotate(cds, new providers.CDSRequestProvider());

module.exports = cds.server;
