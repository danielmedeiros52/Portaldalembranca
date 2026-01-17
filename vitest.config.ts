import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  test: {
    globals: true,
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts", "tests/**/*.test.ts"],
    exclude: ["node_modules", "dist", "build", ".lint-tmp"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/types.ts",
        "scripts/",
        "drizzle/",
        "client/src/**",
      ],
      include: ["server/**/*.ts"],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./client/src"),
      "@shared": path.resolve(import.meta.dirname, "./shared"),
    },
  },
});