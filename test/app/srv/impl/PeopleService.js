


module.exports = async (srv) => {

  srv.on("freeAction", (evt) => {
    return { "service": "CDS", name: evt.data.name };
  });

  srv.on("freeActionV2", (evt) => {
    return { "service": "CDS V2", name: evt.data.name + " V2" };
  });

};
