import { defineConfig } from "electrobun";

export default defineConfig({
  mainProcessEntry: "src/main.ts",
  views: [
    {
      name: "mainview",
      entry: "src/view/index.html",
    },
  ],
});
