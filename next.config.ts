import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const connectSources = ["'self'", "https://*.supabase.co", "https://api.kiwoom.com"];

if (supabaseUrl) {
  connectSources.push(supabaseUrl);
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.kakaocdn.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  `connect-src ${connectSources.join(" ")}`,
  "font-src 'self' data:",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/insights",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
