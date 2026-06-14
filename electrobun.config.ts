import { defineConfig } from "electrobun/config";

export default defineConfig({
  mainProcessEntry: "src/main.ts",
  views: [
    {
      name: "mainview",
      entry: "src/view/index.html",
      preload: "src/view/preload.ts",
    },
  ],
  build: {
    outDir: "dist",
  },
});