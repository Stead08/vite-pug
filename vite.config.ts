import { defineConfig } from 'vite';
import vitePluginPug from "./plugins/vite-plugin-pug";
import { resolve } from 'path';

export default defineConfig({
  base: "/",
  root: "src/pages",
  build: {
    outDir: resolve(__dirname, "dist/ja"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src", "pages/index.pug"),
        nested: resolve(__dirname, "src", "pages/sub/index.pug"),
      },
      external: ['**/*.pug']
    }
  },
  assetsInclude: ["**/*.pug"],
  plugins: [
    vitePluginPug({
        build: {
            options: {
            pretty: true,
            },
            langDir: "src/i18n",
            primaryLang: "ja",
        },
        serve: {
            options: {
            pretty: true,
            },
        },
    })
  ]
});
