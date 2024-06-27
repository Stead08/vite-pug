import { defineConfig } from 'vite';
import vitePluginPug from "./plugins/vite-plugin-pug";
import { resolve } from 'path';

export default defineConfig({
  base: "/",
  root: "src/pages",
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      external: ['**/*.pug']
    }
  },
  assetsInclude: ["**/*.pug"],
  plugins: [
    vitePluginPug({
        build: {
            pugOptions: {
            pretty: true,
            },
            langsDir: "src/i18n",
            pagesDir: "src/pages",
        },
        serve: {
            options: {
            pretty: true,
            },
        },
    })
  ]
});
