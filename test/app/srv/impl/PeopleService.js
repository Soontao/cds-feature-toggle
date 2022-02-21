


module.exports = async (srv) => {

  const { Peoples } = srv.entities;
  srv.on("freeAction", (evt) => {
    return { "service": "CDS", name: evt.data.name };
  });

  srv.on("freeActionV2", (evt) => {
    return { "service": "CDS V2", name: evt.data.name + " V2" };
  });

  srv.on("UpdateName", async (evt) => {
    const { newName } = evt.data;
    await UPDATE(Peoples, evt.params[0]).set({ Name: newName });
    return newName;
  });

  srv.on("UpdateNameV1", async (evt) => {
    const { newName } = evt.data;
    await UPDATE(Peoples, evt.params[0]).set({ Name: newName });
    return newName + "V1";
  });

  srv.on("UpdateNameV2", async (evt) => {
    const { newName } = evt.data;
    await UPDATE(Peoples, evt.params[0]).set({ Name: newName });
    return newName + "V2";
  });

  srv.on("UpdateNameV3", async (evt) => {
    const { newName } = evt.data;
    await UPDATE(Peoples, evt.params[0]).set({ Name: newName });
    return newName + "V3";
  });

  srv.on("GetName", async (evt) => {
    const { Name } = await SELECT.one.from(Peoples).where({ ID: evt.params[0] });
    return Name;
  });

};
