import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { readFileSync } from "fs";

function loadEnvVars() {
  try {
    const lines = readFileSync(".env.local", "utf-8").split("\n");
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx);
      const val = trimmed.slice(eqIdx + 1);
      process.env[key] = val;
    }
  } catch {}
}

loadEnvVars();

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    fileParallelism: false,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL || "",
      TURSO_AUTH_TOKEN: process.env.TEST_TURSO_AUTH_TOKEN || "",
    },
  },
});
