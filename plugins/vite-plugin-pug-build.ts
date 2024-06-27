import path from "path";
import fs from "fs";
import pug from "pug";
import { Plugin } from "vite";

interface PluginOptions {
  pagesDir: string;
  langsDir: string;
  pugOptions?: pug.Options;
}

interface MetaPage {
  langCode: string | null;
  page: string;
}

const isDirectory = async (path: string): Promise<boolean> => {
  const stats = await fs.promises.stat(path);
  return stats.isDirectory();
};

const getFilelist = async (baseDir: string, ext = '.pug'): Promise<Array<string>> => {
  const files = await fs.promises.readdir(baseDir);
  const filePromises = files.map(async (file) => {
    const resolvedPath = path.resolve(baseDir, file);
    return (await isDirectory(resolvedPath)) ? getFilelist(resolvedPath, ext) : (path.extname(resolvedPath) === ext ? [resolvedPath] : []);
  });
  const fileArrays = await Promise.all(filePromises);
  return fileArrays.flat();
};

const loadLang = async (langPath: string) => {
  const langCode = path.basename(langPath, ".json");
  const langJson = await fs.promises.readFile(langPath, "utf-8");
  const langObject = JSON.parse(langJson);
  const translations = Object.fromEntries(Object.entries(langObject).map(([key, value]) => [`__${key}`, value]));
  return { langCode, translations };
};

const vitePluginPugI18n = ({ pagesDir, langsDir, pugOptions = {} }: PluginOptions) : Plugin => {
  const langMap = new Map<string, any>();
  const langMetaMap = new Map<string, MetaPage>();
  const pageMap = new Map<string, pug.compileTemplate>();
  let pagesFound: Array<string> = [];

  const loadLangs = async () => {

    const langsFound = await getFilelist(langsDir, '.json');
    const langPromises = langsFound.map(loadLang);
    const langResults = await Promise.all(langPromises);
    langResults.forEach(({ langCode, translations }) => {
      langMap.set(langCode, translations);
    });
  };

  const loadPages = async () => {
    pagesFound = await getFilelist(pagesDir);
  };

  const getDistPath = (baseDir: string, page: string, langCode = ''): string => {
    const relativePath = path.relative(baseDir, page).replace(/\.pug$/, ".html");
    return langCode ? path.normalize(`${baseDir}/${langCode}/${relativePath}`) : path.normalize(`${baseDir}/${relativePath}`);
  };

  const processPages = () => {
    const input: Record<string, string> = {};
    pagesFound.forEach(page => {
      if (langMap.size > 0) {
        langMap.forEach((_, langCode) => {
          const distPath = getDistPath(pagesDir, page, langCode);
          input[distPath] = distPath;
          langMetaMap.set(distPath, { langCode, page });
        });
      } else {
        const distPath = getDistPath(pagesDir, page);
        input[distPath] = distPath;
        langMetaMap.set(distPath, { langCode: null, page });
      }
    });
    return input;
  };

  return {
    name: "vite-plugin-pug-i18n",
    enforce: "pre",
    apply: "build",

    async config(userConfig) {
      console.log(pagesDir, langsDir, pugOptions);
      await loadPages();
      await loadLangs();
      path.normalize(pagesDir).replace(/^(\/|\\)+/, '').replace(/\\+/g, '/');
      const prefix = userConfig.base;

      return {
        build: {
          rollupOptions: {
            input: processPages(),
            output: {
              assetFileNames: `assets/[name]-[hash][extname]`,
              chunkFileNames: `assets/[name]-[hash].js`
            }
          }
        },
        base: prefix && !pagesDir ? prefix : '/'
      };
    },

    resolveId(id, importer) {
      if (langMetaMap.has(id)) return id;
      if (importer && langMetaMap.has(importer)) {
        if (id === "vite/modulepreload-polyfill") {
          return;
        }
      }
    },

    async load(id) {
      const meta = langMetaMap.get(id);
      if (!meta) return;

      const { langCode, page } = meta;
      let template = pageMap.get(page);

      if (!template) {
        template = pug.compileFile(page, pugOptions);
        pageMap.set(page, template);
      }

      if (langCode) {
        const translations = langMap.get(langCode);
        return template({ ...translations, base: pagesDir });
      } else {
        return template({ base: pagesDir });
      }
    }
  };
};

export default vitePluginPugI18n;
