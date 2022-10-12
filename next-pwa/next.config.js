/** @type {import('next').NextConfig} */
const nextPWA = require("next-pwa");
const path = require('path');
const loaderUtils = require('loader-utils');
const WebpackObfuscator = require("webpack-obfuscator");
const runtimeCaching = require("next-pwa/cache");
const { i18n } = require('./next-i18next.config');

const enableObfuscation = process.env.USE_JS_OBFUSCATION === "1";

console.log("obfuscation flag is", enableObfuscation);

// based on https://github.com/vercel/next.js/blob/0af3b526408bae26d6b3f8cab75c4229998bf7cb/packages/next/build/webpack/config/blocks/css/loaders/getCssModuleLocalIdent.ts
const hashOnlyIdent = (context, _, exportName) =>
  loaderUtils
    .getHashDigest(
      Buffer.from(
        `filePath:${path
          .relative(context.rootContext, context.resourcePath)
          .replace(/\\+/g, '/')}#className:${exportName}`,
      ),
      'md4',
      'base64',
      6,
    )
    .replace(/^(-?\d|--)/, '_$1');

const withPWA = nextPWA({
  dest: "public",
  runtimeCaching,
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  i18n,
  webpack: (config, { defaultLoaders, isServer, dev }) => {
    if (enableObfuscation && !isServer)
      config.plugins.push(new WebpackObfuscator({
        compact: true,
        identifierNamesGenerator: 'mangled',
        selfDefending: true,
        stringArray: true,
        rotateStringArray: true,
        shuffleStringArray: true,
        stringArrayEncoding: [],
        stringArrayThreshold: 0.8,
        splitStrings: true,
        splitStringsChunkLength: 6,
        transformObjectKeys: true,
      }));

    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use));

    if (!dev)
      rules.forEach((rule) => {
        rule.use.forEach((moduleLoader) => {
          if (
            moduleLoader.loader?.includes('css-loader') &&
            !moduleLoader.loader?.includes('postcss-loader')
          )
            moduleLoader.options.modules.getLocalIdent = hashOnlyIdent;

          // earlier below statements were sufficient:
          // delete moduleLoader.options.modules.getLocalIdent;
          // moduleLoader.options.modules.localIdentName = '[hash:base64:6]';
        });
      });

    return config;
  }
});
