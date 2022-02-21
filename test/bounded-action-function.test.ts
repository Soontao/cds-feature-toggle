// @ts-ignore
import cds from "@sap/cds/lib";
import { buildConfig } from "./shared";


describe("Bounded Action/Function Test Suite", () => {

  const axios = cds.test(".").in(__dirname, "app");

  it("should support restrict features for bounded action/function ", async () => {

    const ENTRY = "/people/Peoples";
    const r1 = await axios.post(ENTRY, { Name: "111" }, buildConfig("people-service"));
    expect(r1.status).toBe(201);
    expect(r1.data.Name).toBe("111");
    expect(r1.data.ID).not.toBeUndefined();

    const peopleId = r1.data.ID;

    const r2 = await axios.patch(ENTRY + `(${peopleId})`, { Name: "222" }, buildConfig("people-service"));
    expect(r2.status).toBe(200);
    expect(r2.data.Name).toBe("222");

    const r3 = await axios.get(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.GetName()`,
      buildConfig()
    );
    expect(r3.status).toBe(400);
    expect(r3.data.error.message).toContain("GetName is not enabled");

    const r4 = await axios.get(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.GetName()`,
      buildConfig("people-service")
    );
    expect(r4.status).toBe(400);
    expect(r4.data.error.message).toContain("GetName is not enabled");


    const r5 = await axios.get(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.GetName()`,
      buildConfig("people-service", "feat-get-people-name")
    );
    expect(r5.status).toBe(200);
    expect(r5.data.value).toContain("222");

    const r6 = await axios.post(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.UpdateName`,
      { newName: "333" },
      buildConfig("people-service", "feat-update-people-name")
    );
    expect(r6.status).toBe(200);
    expect(r6.data.value).toContain("333");

  });

  it("should support redirect for bounded action/function", async () => {
    const ENTRY = "/people/Peoples";
    const r1 = await axios.post(ENTRY, { Name: "111" }, buildConfig("people-service"));
    expect(r1.status).toBe(201);
    expect(r1.data.Name).toBe("111");
    expect(r1.data.ID).not.toBeUndefined();

    const peopleId = r1.data.ID;

    const r6 = await axios.post(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.UpdateNameV1`,
      { newName: "333" },
      buildConfig("people-service")
    );
    expect(r6.status).toBe(200);
    expect(r6.data.value).toBe("333V1");

    const r7 = await axios.post(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.UpdateNameV1`,
      { newName: "333" },
      buildConfig("people-service", "feat-update-people-name-v2")
    );
    expect(r7.status).toBe(200);
    expect(r7.data.value).toBe("333V2");

    const r8 = await axios.post(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.UpdateNameV1`,
      { newName: "444" },
      buildConfig("people-service", "feat-update-people-name-v3")
    );
    expect(r8.status).toBe(200);
    expect(r8.data.value).toBe("444V3");

    const r9 = await axios.post(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.UpdateNameV2`,
      { newName: "555" },
      buildConfig("people-service", "feat-update-people-name-v3")
    );
    expect(r9.status).toBe(200);
    expect(r9.data.value).toBe("555V3");

    const r10 = await axios.post(
      ENTRY + `(${peopleId})/test.app.people.PeopleService.UpdateNameV2`,
      { newName: "555" },
      buildConfig("people-service")
    );
    expect(r10.status).toBe(400);
    expect(r10.data.error.message).toContain("UpdateNameV2 is not enabled");
  });

});
