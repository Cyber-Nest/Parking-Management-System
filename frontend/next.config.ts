import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  /** Pin Turbopack to this app so env and lockfile are not picked up from a parent folder (e.g. `~/package-lock.json`). */
  turbopack: {
    root: __dirname,
  },
  /** In dev, proxy `/api/*` to the Express backend so the browser uses same-origin requests (avoids CORS when using LAN hostnames). */
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    const target = (process.env.BACKEND_URL ?? "http://127.0.0.1:5000").replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${target}/api/:path*` }];
  },
};

export default nextConfig;
