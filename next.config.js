const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
              "font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com data:",
              "img-src 'self' data: blob: https://pjctzerjlxufyzwqrocz.supabase.co https://*.supabase.co https://vercel.live https://assets.vercel.com https://vercel.com",
              "connect-src 'self' https://pjctzerjlxufyzwqrocz.supabase.co https://*.supabase.co https://vercel.live https://*.vercel.live https://*.pusher.com https://*.pusherapp.com",
              "frame-src 'self' https://vercel.live",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
