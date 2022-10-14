const typescript = require('rollup-plugin-typescript2');
const commonjs = require('rollup-plugin-commonjs');
const external = require('rollup-plugin-peer-deps-external');
const postcss = require('rollup-plugin-postcss');
const resolve = require('rollup-plugin-node-resolve');
const url = require('@rollup/plugin-url');
const image = require('@rollup/plugin-image');
const svgr = require('@svgr/rollup');

const pkg = require('./package.json');

module.exports = {
  input: 'src/index.tsx',
  external: ['react', 'react-dom', 'crypto'],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    postcss({
      extensions: ['.css', '.scss'],
      modules: false,
      use: ['sass'],
      extract: true,
      minimize: true,
    }),
    url(),
    svgr(),
    resolve(),
    typescript({
      typescript: require('typescript'),
      clean: true
    }),
    image(),
    commonjs()
  ]
}
