import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildApp } from "../src/app";
import {
  getStudies,
  getStudiesByUid,
  StudyNotFoundError,
} from "../src/clients/dicomweb.client";

vi.mock("../src/clients/dicomweb.client", () => ({
  getStudies: vi.fn(),
  getStudiesByUid: vi.fn(),
  StudyNotFoundError: class extends Error {},
}));

const mockedGetStudies = vi.mocked(getStudies);
const mockedGetStudyByUid = vi.mocked(getStudiesByUid);

describe("MedImaging API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const app = buildApp();

  afterEach(async () => {
    await app.ready();
  });

  it("GET /health returns 200", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("GET /api/studies returns studies", async () => {
    const studies = [
      {
        "0020000D": {
          vr: "UI",
          Value: ["1.2.3.4.5"],
        },
      },
    ];

    mockedGetStudies.mockResolvedValue(studies);

    const response = await app.inject({
      method: "GET",
      url: "/api/studies",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(studies);
    expect(mockedGetStudies).toHaveBeenCalledOnce();
  });

  it("returns 502 when OrthanC fails", async () => {
    mockedGetStudies.mockRejectedValue(new Error("OrthanC connection refused"));

    const response = await app.inject({
      method: "GET",
      url: "/api/studies",
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({ error: "Unable to retrieve studies" });
  });

  it("does not expose internal errors", async () => {
    mockedGetStudies.mockRejectedValue(
      new Error("Sensitive internal connection details"),
    );

    const response = await app.inject({
      method: "GET",
      url: "/api/studies",
    });

    expect(response.statusCode).toBe(502);

    expect(response.json()).toEqual({ error: "Unable to retrieve studies" });

    expect(response.body).not.toContain({
      error: "Sensitive internal connection details",
    });
  });

  it("returns 400 for an invalid StudyInstanceUID", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/studies/invalid-uid",
    });

    expect(response.statusCode).toBe(400);
    expect(mockedGetStudyByUid).not.toHaveBeenCalled();
  });

  it("returns 200 for an existing study", async () => {
    const study = {
      "020000D": {
        vr: "UI",
        Value: ["1.2.3.4.5"],
      },
    };

    mockedGetStudyByUid.mockResolvedValue(study);

    const response = await app.inject({
      method: "GET",
      url: "/api/studies/1.2.3.4.5",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(study);
    expect(mockedGetStudyByUid).toHaveBeenCalledWith("1.2.3.4.5");
  });

  it("returns 404 when the study does not exist", async () => {
    mockedGetStudyByUid.mockRejectedValue(new StudyNotFoundError());

    const response = await app.inject({
      method: "GET",
      url: "/api/studies/1.2.3.999",
    });

    console.log("==========");
    console.log(response);
    console.log("==========");

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "Study not found" });
  });

  it("returns 502 when the DICOM provider fails", async () => {
    mockedGetStudyByUid.mockRejectedValue(new Error("Connection refused"));

    const response = await app.inject({
      method: "GET",
      url: "/api/studies/1.2.3.4.5",
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({ error: "Unable to retrieve study" });
  });
});
