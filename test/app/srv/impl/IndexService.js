


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


  // another example, consume another 'service'
  srv.on("classRecords", async () => {
    const ClassService = await cds.connect.to("ClassService");
    const { Classes } = ClassService.entities;
    const { total } = await ClassService.run(SELECT.from(Classes).columns("count(1) as total"));
    return total;
  });

};
