/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable padding-line-between-statements */
/* eslint-disable @typescript-eslint/naming-convention */

const fs = require("fs");
const os = require("os");
const path = require("path");
const resolve = require("resolve");
const webpack = require("webpack");

const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const DotEnv = require("dotenv-webpack");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const TerserPlugin = require("terser-webpack-plugin");

const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

const ForkTsCheckerWebpackPlugin =
  process.env.TSC_COMPILE_ON_ERROR === "true"
    ? require("react-dev-utils/ForkTsCheckerWarningWebpackPlugin")
    : require("react-dev-utils/ForkTsCheckerWebpackPlugin");

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP === "false";
const disableEslint = process.env.DISABLE_ESLINT_PLUGIN === "true";
const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || (1024 * 1024 * 10).toString(), 10);
const useTailwind = fs.existsSync(path.join(".", "tailwind.config.js"));

const publicUrlOrPath = process.env.PUBLIC_URL || require("./package.json").homepage;

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

module.exports = (webpackEnv) => {
  const isProduction = webpackEnv.env === "production";
  const isDevelopment = !isProduction;

  console.log(`building for env`, webpackEnv);

  let envFilePath = `.env.${process.env.APP_ENV}`;

  if (!fs.existsSync(envFilePath)) {
    console.info(`${envFilePath} does not exist! falling back to .env`);

    envFilePath = ".env";
  }

  console.info(`Using dotenv file ${envFilePath}`);

  const publicEnv = Object.keys(process.env)
    .filter((key) => /^PUBLIC_/.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];

        return env;
      },
      {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV || "development",
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrlOrPath,
        // We support configuring the sockjs pathname during development.
        // These settings let a developer run multiple simultaneous projects.
        // They are used as the connection `hostname`, `pathname` and `port`
        // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
        // and `sockPort` options in webpack-dev-server.
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        // Whether or not react-refresh is enabled.
        // It is defined here so it is available in the webpackHotDevClient.
        FAST_REFRESH: process.env.FAST_REFRESH !== "false",
      }
    );

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isDevelopment && require.resolve("style-loader"),
      isProduction && {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: publicUrlOrPath.startsWith(".") ? { publicPath: "../../" } : {},
      },
      {
        loader: require.resolve("css-loader"),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            // Necessary for external CSS imports to work
            // https://github.com/facebook/create-react-app/issues/2677
            ident: "postcss",
            config: false,
            plugins: !useTailwind
              ? [
                  "postcss-flexbugs-fixes",
                  [
                    "postcss-preset-env",
                    {
                      autoprefixer: {
                        flexbox: "no-2009",
                      },
                      stage: 3,
                    },
                  ],
                  // Adds PostCSS Normalize as the reset css with default options,
                  // so that it honors browserslist config in package.json
                  // which in turn let's users customize the target behavior as per their needs.
                  "postcss-normalize",
                ]
              : [
                  "tailwindcss",
                  "postcss-flexbugs-fixes",
                  [
                    "postcss-preset-env",
                    {
                      autoprefixer: {
                        flexbox: "no-2009",
                      },
                      stage: 3,
                    },
                  ],
                ],
          },
          sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve("resolve-url-loader"),
          options: {
            sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
            root: path.resolve("./src"),
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
          },
        }
      );
    }
    return loaders;
  };

  return {
    target: ["browserslist"],
    // Webpack noise constrained to errors and warnings
    stats: "errors-warnings",
    mode: isProduction ? "production" : "development",
    // Stop compilation early in production
    bail: isProduction,
    devtool: isProduction ? (shouldUseSourceMap ? "source-map" : false) : isDevelopment && "cheap-module-source-map",
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: {
      main: "./src/index.tsx",
    },
    output: {
      // The build folder.
      path: path.resolve("./dist"),
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isProduction ? "static/js/[name].[contenthash:8].js" : isDevelopment && "static/js/bundle.js",
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isProduction ? "static/js/[name].[contenthash:8].chunk.js" : "static/js/[name].chunk.js",
      assetModuleFilename: "static/media/[name].[hash][ext]",
      // webpack uses `publicPath` to determine where the app is being served from.
      // It requires a trailing slash, or the file assets will get an incorrect path.
      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath: "./public",
    },
    cache: {
      type: "filesystem",
      cacheDirectory: path.resolve("./.webpack"),
      store: "pack",
      buildDependencies: {
        defaultWebpack: ["webpack/lib/"],
        config: [__filename],
        tsconfig: ["tsconfig.json"],
      },
    },
    infrastructureLogging: {
      level: "none",
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          parallel: os.cpus().length,
          terserOptions: {
            parse: {
              // We want terser to parse ecma 8 code. However, we don't want it
              // to apply any minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
              drop_console: true,
            },
            mangle: {
              safari10: true,
            },
            // Added for profiling in devtools
            keep_classnames: isDevelopment,
            keep_fnames: isDevelopment,
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
        }),
        // This is only used in production mode
        new CssMinimizerPlugin(),
      ],
    },
    resolve: {
      // This allows you to set a fallback for where webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ["node_modules"],
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        // Allows for better profiling with ReactDevTools
        ...(isDevelopment && {
          "react-dom$": "react-dom/profiling",
          "scheduler/tracing": "scheduler/tracing-profiling",
        }),
      },
      plugins: [
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin("./src", ["./package.json"]),
      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Handle node_modules packages that contain sourcemaps
        shouldUseSourceMap && {
          enforce: "pre",
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|mjs|jsx|ts|tsx|css)$/,
          loader: require.resolve("source-map-loader"),
        },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // TODO: Merge this config once `image/avif` is in the mime-db
            // https://github.com/jshttp/mime-db
            {
              test: [/\.avif$/],
              type: "asset",
              mimetype: "image/avif",
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit,
                },
              },
            },
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              type: "asset",
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit,
                },
              },
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: require.resolve("@svgr/webpack"),
                  options: {
                    prettier: false,
                    svgo: false,
                    svgoConfig: {
                      plugins: [{ removeViewBox: false }],
                    },
                    titleProp: true,
                    ref: true,
                  },
                },
                {
                  loader: require.resolve("file-loader"),
                  options: {
                    name: "static/media/[name].[hash].[ext]",
                  },
                },
              ],
              issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: path.resolve("./src"),
              use: "ts-loader",
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: "@svgr/webpack",
                  options: {
                    svgoConfig: {
                      plugins: {
                        removeViewBox: false,
                      },
                    },
                  },
                },
                "url-loader",
              ],
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
                modules: {
                  mode: "icss",
                },
              }),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
                modules: {
                  mode: "local",
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }),
            },
            // Opt-in support for SASS (using .scss or .sass extensions).
            // By default we support SASS Modules with the
            // extensions .module.scss or .module.sass
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
                  modules: {
                    mode: "icss",
                  },
                },
                "sass-loader"
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules, but using SASS
            // using the extension .module.scss or .module.sass
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
                  modules: {
                    mode: "local",
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                },
                "sass-loader"
              ),
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: "asset/resource",
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ].filter(Boolean),
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: "./public/index.html",
        ...(isProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
          : undefined),
      }),
      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      // https://github.com/facebook/create-react-app/issues/5358
      isProduction && new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
      // It will be an empty string unless you specify "homepage"
      // in `package.json`, in which case it will be the pathname of that URL.
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, publicEnv),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(
        Object.keys(publicEnv).reduce((env, key) => {
          env[key] = JSON.stringify(publicEnv[key]);

          return env;
        }, {})
      ),
      // Experimental hot reloading for React .
      // https://github.com/facebook/react/tree/main/packages/react-refresh
      isDevelopment &&
        new ReactRefreshWebpackPlugin({
          overlay: false,
        }),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebook/create-react-app/issues/240
      isDevelopment && new CaseSensitivePathsPlugin(),
      isProduction &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        }),
      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the webpack build.
      // isProduction &&
      //   fs.existsSync(swSrc) &&
      //   new WorkboxWebpackPlugin.InjectManifest({
      //     swSrc,
      //     dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
      //     exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
      //     // Bump up the default maximum size (2mb) that's precached,
      //     // to make lazy-loading failure scenarios less likely.
      //     // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
      //     maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      //   }),
      // TypeScript type checking
      new ForkTsCheckerWebpackPlugin({
        async: isDevelopment,
        typescript: {
          typescriptPath: resolve.sync("typescript", {
            basedir: "./node_modules/",
          }),
          configOverwrite: {
            compilerOptions: {
              sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
              skipLibCheck: true,
              inlineSourceMap: false,
              declarationMap: false,
              noEmit: true,
              incremental: true,
              tsBuildInfoFile: "node_modules/.cache/tsconfig.tsbuildinfo",
            },
          },
          context: ".",
          diagnosticOptions: {
            syntactic: true,
          },
          mode: "write-references",
          // profile: true,
        },
        issue: {
          // This one is specifically to match during CI tests,
          // as micromatch doesn't match
          // '../cra-template-typescript/template/src/App.tsx'
          // otherwise.
          include: [{ file: "../**/src/**/*.{ts,tsx}" }, { file: "**/src/**/*.{ts,tsx}" }],
          exclude: [
            { file: "**/src/**/__tests__/**" },
            { file: "**/src/**/?(*.){spec|test}.*" },
            { file: "**/src/setupProxy.*" },
            { file: "**/src/setupTests.*" },
          ],
        },
        logger: {
          infrastructure: "silent",
        },
      }),
      !disableEslint &&
        new ESLintPlugin({
          // Plugin options
          extensions: ["js", "mjs", "jsx", "ts", "tsx"],
          formatter: require.resolve("react-dev-utils/eslintFormatter"),
          eslintPath: require.resolve("eslint"),
          failOnError: isProduction,
          context: "./src",
          cache: true,
          cacheLocation: path.resolve("./node_modules/", ".cache/.eslintcache"),
          // ESLint class options
          cwd: path.resolve("."),
          resolvePluginsRelativeTo: __dirname,
        }),
      new DotEnv({
        path: envFilePath,
        safe: true,
        allowEmptyValues: true,
        silent: false,
      }),
    ].filter(Boolean),
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false,
  };
};
