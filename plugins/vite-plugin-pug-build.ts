import fs from "fs";
import path from "path";
import type { Plugin } from "vite";
import { compileFile } from "pug";
import type { Options } from "pug";

interface PugSettings {
  locals?: string;
  options: Options;
  langDir?: string;
  primaryLang?: string; // プライマリ言語の追加
}

export const vitePluginPugBuild = ({
                                     options,
                                     langDir,
                                     primaryLang, // プライマリ言語の追加
                                   }: PugSettings): Plugin => {
  const loadLanguages = () =>
      langDir
          ? fs.readdirSync(langDir)
              .filter(file => file.endsWith('.json'))
              .map(file => ({
                lang: path.basename(file, '.json'),
                data: JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf-8'))
              }))
          : [];

  const languages = loadLanguages();

  const generateHtml = (pugFile: string, data: Record<string, any>, lang: string) => {
    const html = compileFile(pugFile, options)(data);
    const outputPath = path.join("dist", lang, path.relative("src/pages", pugFile).replace(/\.pug$/, ".html"));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html, "utf-8");
  };

  return {
    name: "vite-plugin-pug-build",
    enforce: "pre",
    apply: "build",
    resolveId(source: string) {
      if (source.endsWith(".pug")) {
        return source.replace(/\.pug$/, ".html");
      }
      return null;
    },
    load(id: string) {
      if (id.endsWith(".html")) {
        const pugFile = id.replace(/\.html$/, ".pug");
        if (fs.existsSync(pugFile)) {
          languages.forEach(({ lang, data }) => generateHtml(pugFile, data, lang));

          // プライマリ言語のHTMLを返す
          const primaryLangData = languages.find(({ lang }) => lang === primaryLang);
          if (primaryLangData) {
            return compileFile(pugFile, options)(primaryLangData.data);
          }
        }
      }
      return null;
    }
  };
};
