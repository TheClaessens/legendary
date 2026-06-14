import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { globals: false },
  resolve: {
    alias: {
      "@legendary/game-engine": path.resolve(
        __dirname,
        "../../packages/game-engine/src/index.ts",
      ),
      "@legendary/db": path.resolve(
        __dirname,
        "../../packages/db/src/index.ts",
      ),
    },
  },
});
