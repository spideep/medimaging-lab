import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildApp } from "../src/app";
import { getStudies } from "../src/clients/dicomweb.client";

vi.mock("../src/clients/dicomweb.client", () => ({
  getStudies: vi.fn(),
}));

const mockedGetStudies = vi.mocked(getStudies);

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
});
