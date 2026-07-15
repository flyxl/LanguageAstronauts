import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: ".",
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "../app/assets/scripts")
    }
  },
  // Android 9 WebView：关掉 minify，避免 `? 0.65` 被压成非法/歧义的 `?.65`。
  build: {
    target: "es2019",
    cssTarget: "chrome69",
    minify: false
  },
  esbuild: {
    target: "es2019"
  },
  server: {
    port: 5173,
    open: false
  }
});
