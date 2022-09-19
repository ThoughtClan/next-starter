/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-extraneous-dependencies
const FormData = require("form-data");
const nextPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");

// eslint-disable-next-line no-undef
globalThis.FormData = FormData;

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
});
