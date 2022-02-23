const { withFeature } = require("../../../../src/wrapper");



module.exports = async (srv) => {

  // inline handler
  srv.on("metric", (evt) => {
    return { "service": "CDS", name: evt.data.name };
  });

  srv.on("metricV2", (evt) => {
    return { "service": "CDS V2", name: evt.data.name + " V2" };
  });

  srv.on("metricV3", (evt) => {
    return { "service": "CDS V3", name: evt.data.name + " V3" };
  });

  const handler = (req) => {
    const { name } = req.data; // get data from context
    return { "service": `hello ${name}` };
  };

  srv.on("metric2", handler);

  srv.on("freeAction001", withFeature({ required: "feat-action-001" })(() => {
    return { "service": "CDS", name: "freeAction001" };
  }));

  srv.on("freeAction002", withFeature({ required: ["feat-action-001", "feat-action-002"] }, () => {
    return { "service": "CDS", name: "freeAction002" };
  }));

};
