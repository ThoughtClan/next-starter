# NextJS Starter Template

This repository contains a template for bootstrapping new NextJS projects, customised slightly to fit conventions
folowed at ThoughtClan.

## Setting Up

Create a new project using this template by using the `create-next-app` tool:

`npx create-next-app --example https://github.com/ThoughtClan/next-starter <PROJECT_NAME>`

This will set up a new project in a directory created using the `<PROJECT_NAME>` value.

## Development

To run the local development server, simply run `yarn run dev` which will start up the development server and can be
viewed at [localhost:3000](https://localhost:3000).

## Configuration

### PWA

This template is configured with a PWA setup out of the box using the `next-pwa` package. This can be modified if required,
or removed altogether, by removing the appropriate section of [`next.config.js`](./next.config.js):

```diff
/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-extraneous-dependencies
const FormData = require("form-data");
-const nextPWA = require("next-pwa");
-const runtimeCaching = require("next-pwa/cache");

// eslint-disable-next-line no-undef
globalThis.FormData = FormData;

-const withPWA = nextPWA({
-  dest: "public",
-  runtimeCaching,
-  register: true,
-  skipWaiting: true,
-});

-module.exports = withPWA({
-  reactStrictMode: true,
-  swcMinify: true,
-});
+module.exports = {
+  reactStrictMode: true,
+  swcMinify: true,
+};
```


## Guidelines

### Folder Structure

For the most part, the structure follows the NextJS specified folder structure. Every page in the app will be placed under
`pages` where the NextJS framework will automatically detect the pages and create separate JS bundles and server rendering
paths for them.

More guidelines for working with NextJS can be found in their documentation and everything mentioned there applies here
as well.

The main different being the structure of the `api` folder. In the NextJS convention, this folder contains files that
directly map to a page under `pages`, causing that route to behave like an API endpoint rather than a HTML document.
However, this is not applicable in the case of apps that use external APIs rather the using the same server as an API.
In almost all projects at ThoughtClan, we use a different pure-backend application to host APIs and hence this is not
required for us. We instead use the `api` folder to store these API integration modules. Refer to the code and the inline
documentation for additional context on what these modules do.

If, however, the NextJS API setup is required, it can still be followed by creating files in the `api` directory that
directly map to a `page`.

### API Integration

All API requests done are generally routed through the same API module so that it can take care of things like configuration
for API base URLs, appending authentication headers etc.

More details can be seen in inline documentation in the [`Api`](./pages/api/api.ts) file.

The general guideline regarding this to create `XRequests.ts` files for each backend service that the app talks to and
group all requests from the same service into the same file.

An example of the usage both on client-side and server-side rendering can be seen in the [sample index page](./pages/index.tsx).

### Bundle Splitting

NextJS automatically takes care of bundle splitting at a page level and image related optimsations using the `next/image` component
to load images.

However, in case there is some additional bundle splitting required in the case of heavy non-page modules etc., we can
demarcate an additional point of splitting by using Webpack's lazy imports:

```jsx
// Normal JS module

const module = await import("some-module");

module.doSomething();

// React components

const SomeComponent = React.lazy(() => import("SomeComponent"));

function SomeOtherComponent() {
    return (
        <React.Suspense loader={<Loader />}>
            <SomeComponent />
        </React.Suspense>
    );
}
```

Using the `import()` method provided by webpack will ensure that the target module is *not* bundled with the rest of the
current module, but is instead extracted into a separate JS chunk that is loaded at runtime when the importing code is
executed. The `import()` function returns a promise as it needs to asynchronously load the chunk containing the module
over network and only then can resolve the module.

### Console logging

The Webpack configuration includes a plugin to strip all console logs from production, so that we can be free to include
console logs in our code for development purposes. This can be very hepful in debugging the app if used correctly.

The general guideline regarding using console logs is to "tag" each log message with the name of the class, or in the case
of non-classes, the function or the module in which the log is being called. This makes it easy to identify which log message
is coming from where and can trace it appropriately.

For example, in the `Api` class, all log messages are formatted as `"[Api] some log message"`. Following a consistent
tagging format like this makes it easy to filter logs by a module when debugging. Using the log window's filter option,
we can add an `[Api]` filter to only view all logs coming from that particular class.

Similarly, logging all over the application **should** follow this format for consistency.

### Code Formatting

The project will be set up with ESLint and Prettier, which can be run on the command line using `yarn run lint` or viewed
in your editor if it supports ESLint.

For VSCode, the project-level configuration includes a setting to automatically format and fix auto-fixable problems on save.

## Production

For production deployment, a Docker configuration is included to build an image containing all the necessary steps to
release the app to production. This image can then be deployed to a server or in a cluster to serve the app to users.
