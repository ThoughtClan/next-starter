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
