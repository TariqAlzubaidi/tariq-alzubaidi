import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages builds (GITHUB_PAGES=true) are static, client-only, served under /tariq-alzubaidi/.
// The Lovable preview keeps its dev server entry.
const isPages = process.env.GITHUB_PAGES === "true";

export default defineConfig(
  isPages
    ? { vite: { base: "/tariq-alzubaidi/", build: { outDir: "./dist" } } }
    : { tanstackStart: { server: { entry: "./src/server" } } },
);
