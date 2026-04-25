export type InAppBrowser = "kakaotalk" | null;

export function detectInAppBrowser(userAgent: string): InAppBrowser {
  return /KAKAOTALK/i.test(userAgent) ? "kakaotalk" : null;
}

export function buildKakaoExternalBrowserUrl(targetUrl: string) {
  return `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`;
}
