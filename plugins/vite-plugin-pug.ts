import type { LocalsObject, Options } from "pug";
import  vitePluginPugBuild from "./vite-plugin-pug-build";
import { vitePluginPugServe } from "./vite-plugin-pug-serve";

type PugSettings = {
  options: Options;
    langsDir?: string;
    pagesDir?: string;

};
const vitePluginPug = (settings?: {
  build?: Partial<PugSettings>;
  serve?: Partial<PugSettings>;
}) => {
  const buildSettings = {
    pugOptions: { ...settings?.build?.options },
    langsDir: settings?.build?.langsDir,
    pagesDir: settings?.build?.pagesDir,
  };
  const serveSettings = {
    options: { ...settings?.serve?.options },
  };

  return [
    vitePluginPugBuild({
      pugOptions: buildSettings.pugOptions,
      langsDir: buildSettings.langsDir,
      pagesDir: buildSettings.pagesDir
    }),
    vitePluginPugServe({
      options: serveSettings.options,

    }),
  ];
};

export default vitePluginPug;