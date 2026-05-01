export type KiwoomConfig = {
  appKey: string;
  appSecret: string;
  baseUrl: string;
};

type KiwoomEnv = Record<string, string | undefined> & {
  KIWOOM_APP_KEY?: string;
  KIWOOM_APP_SECRET?: string;
  KIWOOM_BASE_URL?: string;
};

export function createKiwoomConfig(env: KiwoomEnv): KiwoomConfig | null {
  if (!env.KIWOOM_APP_KEY || !env.KIWOOM_APP_SECRET || !env.KIWOOM_BASE_URL) {
    return null;
  }

  return {
    appKey: env.KIWOOM_APP_KEY,
    appSecret: env.KIWOOM_APP_SECRET,
    baseUrl: env.KIWOOM_BASE_URL,
  };
}
