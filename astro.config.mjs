import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://blog.ghp.magaoidh.pro",
  trailingSlash: "never",
  prefetch: true,
  build: {
    inlineStylesheets: "always",
  },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
