import { describe, expect, it } from "vitest";
import { createKiwoomConfig } from "./kiwoomDomesticValuationProvider";

describe("createKiwoomConfig", () => {
  it("returns config when required values exist", () => {
    expect(
      createKiwoomConfig({
        KIWOOM_APP_KEY: "app-key",
        KIWOOM_APP_SECRET: "app-secret",
        KIWOOM_BASE_URL: "https://api.example.com",
      }),
    ).toEqual({
      appKey: "app-key",
      appSecret: "app-secret",
      baseUrl: "https://api.example.com",
    });
  });

  it("returns null when credentials are missing", () => {
    expect(createKiwoomConfig({})).toBeNull();
  });
});
