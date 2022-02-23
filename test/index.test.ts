// @ts-ignore
import cds from "@sap/cds/lib";
import { HEADER_X_CDS_FEATURES_NAME } from "../src/constants";
import { baseConfig, baseHeaders } from "./shared";

describe("Feature Toggle Test Suite", () => {

  const axios = cds.test(".").in(__dirname, "app");

  it("should could be started", async () => {
    const { data } = await axios.get(`/browse/$metadata`, baseConfig);
    expect(data).toMatch(/Books/);
  });


  it("should have metrics api", async () => {
    const { data } = await axios.get(`/index/$metadata`, baseConfig);
    expect(data).toContain("metric");
    expect(data).toContain("metricV2");
  });

  it("should support call normal APIs", async () => {
    const { data } = await axios.get(`/browse/Books`, baseConfig);
    expect(data).not.toBeUndefined();
  });



  it("should support restrict on service level", async () => {

    const response = await axios.get("/people/Peoples", baseConfig);

    expect(response).not.toBeUndefined();
    expect(response.status).toBe(400);
    expect(response.data.error.message).toContain("Peoples/READ is not enabled");

    const response2 = await axios.get("/people/Peoples", {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "people-service"
      }
    });
    expect(response2).not.toBeUndefined();
    expect(response2.status).toBe(200);

  });

  it("should support restrict features with service & action level ", async () => {

    const r0 = await axios.post("/people/freeAction", { name: "111" }, baseConfig);
    expect(r0.status).toBe(400);
    expect(r0.data.error.message).toContain("freeAction is not enabled");

    const r1 = await axios.post("/people/freeAction", { name: "111" }, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "people-service"
      }
    });
    expect(r1.status).toBe(200);
    expect(r1.data.name).toBe("111");

    const r2 = await axios.post("/people/freeActionV2", { name: "999" }, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "people-service"
      }
    });
    expect(r2.status).toBe(400);
    expect(r2.data.error.message).toContain("freeActionV2 is not enabled");

    const r3 = await axios.post("/people/freeActionV2", { name: "999" }, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "feat-free-action-v2"
      }
    });
    expect(r3.status).toBe(400);
    expect(r3.data.error.message).toContain("freeActionV2 is not enabled");

    const r4 = await axios.post("/people/freeActionV2", { name: "999" }, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "people-service,feat-free-action-v2"
      }
    });
    expect(r4.status).toBe(200);
    expect(r4.data.name).toBe("999 V2");

    const r5 = await axios.post("/people/freeActionV2", { name: "1999" }, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "people-service,all-features"
      }
    });
    expect(r5.status).toBe(200);
    expect(r5.data.name).toBe("1999 V2");


  });

  it("should support restrict on entity event level", async () => {

    const createdOrder = await axios.post("/browse/Orders", {
      amount: 10
    });

    expect(createdOrder.data.ID).not.toBeUndefined();
    expect(createdOrder.data.amount).toBe(10);

    const query1 = await axios.get(`/browse/Orders(${createdOrder.data.ID})`, baseConfig);
    expect(query1.status).toBe(400);
    expect(query1.data.error.message).toContain("Orders/READ is not enabled");

    const query2 = await axios.get(`/browse/Orders(${createdOrder.data.ID})`, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "feat-order-get"
      }
    });

    expect(query2.status).toBe(200);
    expect(query2.data.ID).toBe(createdOrder.data.ID);

    // delete without feature
    const delete1 = await axios.delete(`/browse/Orders(${createdOrder.data.ID})`, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "feat-order-get,feat-order-update"
      }
    });

    expect(delete1.status).toBe(400);
    expect(delete1.data.error.message).toContain("Orders/DELETE is not enabled");

    // delete with feature
    const delete2 = await axios.delete(`/browse/Orders(${createdOrder.data.ID})`, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "feat-order-get,feat-order-delete"
      }
    });

    expect(delete2.status).toBe(204);
  });

  it("should keep the original 404 behavior", async () => {
    // verify not existed action is same as original
    const r1 = await axios.post("/index/metricV9", { name: "whatever 9123" }, baseConfig);
    expect(r1.status).toBe(404);
  });

  it("should support simple feature restriction", async () => {
    const r0 = await axios.post("/index/metricV2", { name: "whatever 9123" }, baseConfig);

    expect(r0.status).toBe(400);
    expect(r0.data.error.message).toContain("metricV2 is not enabled");

    const r1 = await axios.post("/index/metricV2", { name: "whatever 123" }, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "feature-metrics-v2"
      }
    });

    expect(r1.status).toBe(200);
    expect(r1.data.name).toBe("whatever 123 V2");


  });

  it("should support restrict unbound action/function with redirect", async () => {
    const m1 = await axios.post("/index/metric", { name: "31232" }, baseConfig);
    expect(m1.status).toBe(200);
    expect(m1.data.service).toBe("CDS");
    expect(m1.data.name).toBe("31232");

    const m2 = await axios.post("/index/metric", { name: "whatever 9123" }, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "feature-metrics-v2"
      }
    });
    expect(m2.status).toBe(200);
    expect(m2.data.service).toBe("CDS V2");
    expect(m2.data.name).toBe("whatever 9123 V2");

    const m3 = await axios.post("/index/metric", { name: "12389213" }, {
      ...baseConfig,
      headers: {
        ...baseHeaders,
        [HEADER_X_CDS_FEATURES_NAME]: "feature-metrics-v3"
      }
    });
    expect(m3.status).toBe(200);
    expect(m3.data.service).toBe("CDS V3");
    expect(m3.data.name).toBe("12389213 V3");

  });

 

});
