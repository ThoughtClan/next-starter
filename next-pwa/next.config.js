/** @type {import('next').NextConfig} */
const nextPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");
const { i18n } = require('./next-i18next.config');

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
});
