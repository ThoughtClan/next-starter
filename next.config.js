/** @type {import('next').NextConfig} */
const nextPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");

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
