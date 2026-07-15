import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: ".",
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "../app/assets/scripts")
    }
  },
  // play/ 仅为预览；正式交付走 Cocos Native，不依赖 WebView minify 约束。
  server: {
    port: 5173,
    open: false
  }
});
