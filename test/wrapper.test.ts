
import cds from "@sap/cds";
import { baseConfig, buildConfig } from "./shared";

describe("Feature Toggle for wrapper functions Test Suite", () => {

  // @ts-ignore
  const axios = cds.test(".").in(__dirname, "app");

  it("should support programming feature restriction", async () => {
    const m1 = await axios.post("/index/freeAction001", {}, baseConfig);
    expect(m1.status).toBe(400);
    expect(m1.data.error.message).toContain("freeAction001 is not enabled");

    const m2 = await axios.post("/index/freeAction001", {}, buildConfig("feat-action-001"));
    expect(m2.status).toBe(200);
    expect(m2.data.name).toContain("freeAction001");
  });

  it("should support programming feature restriction in another format", async () => {
    const m1 = await axios.post("/index/freeAction002", {}, baseConfig);
    expect(m1.status).toBe(400);
    expect(m1.data.error.message).toContain("freeAction002 is not enabled");

    const m2 = await axios.post("/index/freeAction002", {}, buildConfig("feat-action-002"));
    expect(m2.status).toBe(200);
    expect(m2.data.name).toContain("freeAction002");
  });

});
