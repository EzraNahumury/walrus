import type { NextConfig } from "next";

// Walrus Sites needs a fully static bundle. AI route handlers and other
// server-side features need a normal Next.js runtime. Toggle via env so the
// same source builds both:
//   npm run dev                          → server runtime (AI works)
//   STATIC_EXPORT=1 npm run build        → static `out/` for Walrus Sites
const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(STATIC_EXPORT
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {}),
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
