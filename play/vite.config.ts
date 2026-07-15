import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: ".",
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "../app/assets/scripts")
    }
  },
  server: {
    port: 5173,
    open: false
  }
});
