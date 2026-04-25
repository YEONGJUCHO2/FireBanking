export function getRequiredEnv(name: string) {
  const value =
    name === "NEXT_PUBLIC_SUPABASE_URL"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : name === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
        ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        : process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
