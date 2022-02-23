// @ts-ignore
import cds from "@sap/cds/lib";
import { baseConfig, buildConfig } from "./shared";

describe("Feature Toggle for Entity Level Test Suite", () => {

  const axios = cds.test(".").in(__dirname, "app");

  it("should service could be started", async () => {
    const { data } = await axios.get(`/address/$metadata`, baseConfig);
    expect(data).toMatch(/Address/);
  });

  it("should reject without feature at entity level", async () => {
    const res = await axios.get("/address/Address", baseConfig);
    expect(res.status).toBe(400);
    expect(res.data.error.message).toContain("AddressService.Address/READ is not enabled");
  });

  it("should accept with feature", async () => {
    const res = await axios.get("/address/Address", buildConfig("feat-address-management"));
    expect(res.status).toBe(200);
    expect(res.data.value).toStrictEqual([]);
  });

  it("should reject the inner event without feature", async () => {
    const res = await axios.post("/address/Address", { Country: "China" }, buildConfig("feat-address-management"));
    expect(res.status).toBe(400);
    expect(res.data.error.message).toContain("AddressService.Address/CREATE is not enabled");
  });

  it("should accept the inner event have the feature", async () => {
    const res = await axios.post(
      "/address/Address",
      { Country: "China" },
      buildConfig("feat-address-management", "feat-address-management-add-write")
    );
    expect(res.status).toBe(201);
  });


});
