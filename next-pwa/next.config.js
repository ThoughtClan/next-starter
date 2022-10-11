/** @type {import('next').NextConfig} */
const nextPWA = require("next-pwa");
const WebpackObfuscator = require("webpack-obfuscator");
const runtimeCaching = require("next-pwa/cache");
const { i18n } = require('./next-i18next.config');

const enableObfuscation = process.env.USE_JS_OBFUSCATION === "1";

console.log("obfuscation flag is", enableObfuscation);

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
  webpack: (config, { defaultLoaders, isServer }) => {
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

    return config;
  }
});
