import type { LocalsObject, Options } from "pug";
import { vitePluginPugBuild } from "./vite-plugin-pug-build";
import { vitePluginPugServe } from "./vite-plugin-pug-serve";

type PugSettings = {
  options: Options;
  locals: LocalsObject;
  langDir?: string;
  primaryLang?: string;
};
const vitePluginPug = (settings?: {
  build?: Partial<PugSettings>;
  serve?: Partial<PugSettings>;
}) => {
  const buildSettings = {
    options: { ...settings?.build?.options },
    langDir: settings?.build?.langDir,
    primaryLang: settings?.build?.primaryLang,
  };
  const serveSettings = {
    options: { ...settings?.serve?.options },
    locals: { ...settings?.serve?.locals },
  };

  return [
    vitePluginPugBuild({
      options: buildSettings.options,
        langDir: buildSettings.langDir,
      primaryLang: buildSettings.primaryLang
    }),
    vitePluginPugServe({
      options: serveSettings.options,
      locals: serveSettings.locals,

    }),
  ];
};

export default vitePluginPug;