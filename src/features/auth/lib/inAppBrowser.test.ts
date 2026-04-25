import { describe, expect, it } from "vitest";
import { buildKakaoExternalBrowserUrl, detectInAppBrowser } from "./inAppBrowser";

describe("in-app browser helpers", () => {
  it("detects KakaoTalk in-app browser user agents", () => {
    expect(detectInAppBrowser("Mozilla/5.0 KAKAOTALK 11.4.0")).toBe("kakaotalk");
    expect(detectInAppBrowser("Mozilla/5.0 Safari/605.1.15")).toBeNull();
  });

  it("builds a KakaoTalk external browser URL for the current page", () => {
    expect(buildKakaoExternalBrowserUrl("https://fire-banking.vercel.app/?a=1&b=2")).toBe(
      "kakaotalk://web/openExternal?url=https%3A%2F%2Ffire-banking.vercel.app%2F%3Fa%3D1%26b%3D2",
    );
  });
});
