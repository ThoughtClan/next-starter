# React Library Template

This is a template for a React library that can be published to any npm registry for consumption in other projects.

## Usage

Clone the template using git or (ab)using `create-next-app` and proceed with building out the library components as normal.

The main things to update are in the [package.json](./package.json):

1. The `name` value indicating the library's name. It is better to use scoped values for custom libraries (`@org/package`) format so as to not clash with other package names.
2. The `publishConfig.registry` value. This controls where the server where the package will be published to when running
`npm publish` or similar commands. Ensure authentication for the specified registry is peformed correctly beforehand.

## Feature support

The build for the library will be done using Rollup as it is better suited for libraries than Webpack.

Out of the box, the template will support all the basic features of a React library, including JSX, images, (S)CSS etc. Anything additional required can be
added to the [Rollup configuration](./rollup.config.js).

## Guidelines

### Exports

As this is a library and not a regular react application, it is important to ensure that the `src` directory contains an `index.ts` that exports all the public entities offered by the library, as it is the
root manifest of the library.

Once it has been exported, the consuming app can import it as `import { LibraryComponent } from "@thoughtclan/react-library"`.

### Local testing

When developing the package, the package can be added to the main app through local paths or using the package manager's linking feature.

Check out [Yarn's documentation for linking](https://classic.yarnpkg.com/en/docs/cli/link). Once the package has been linked, Rollup can be started in this project in watch mode using `yarn start` and the changes
made to the libraries will be rebuilt and reflect in the main application.

### Peer dependencies

Packages required by the library that are also expected in the main app (for instance, the React dependency) should be added as peer dependencies. This is
so that the resolved package comes from a single source (the parent's node_modules) and is not
duplicated in runtime by a library-local version of the package.

These dependencies will only truly be resolved when the library is integrated into the main app, and the library's build process ignores these missing dependencies.
