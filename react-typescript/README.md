# React SPA Template

This repository contains a template for bootstrapping new React SPA projects, customised slightly to fit conventions
folowed at ThoughtClan.

## Setting Up

CRA support is still WIP, in the meantime the template can also be used by `create-next-app https://github.com/ThoughtClan/react-templates/tree/main/react-typescript`. Since `create-next-app` simply clones the template into a new directory, it will still work without plugging in
NextJS dependencies.

## Development

To run the local development server, simply run `yarn run dev` which will start up the development server and can be
viewed at [localhost:3000](https://localhost:3000).


## Guidelines

### Folder Structure

The project follows the folder structure described in the [main README](../README.md).

### `IAuthProvider`

The [`IAuthProvider`](./interfaces/auth_provider.ts) interface describes objects that can be used as an authentication provider
for the `Api` module described in the next section.

This allows for flexibility in using different authentication backends as long as they offer
a method to provide the authorisation token needed for API integration.

Objects implementing this interface can be supplied to `Api`s to authenticate requests.

### API Integration

All API requests done are generally routed through the same API module so that it can take care of things like configuration
for API base URLs, appending authentication headers etc.

More details can be seen in inline documentation in the [`Api`](./api/api.ts) file.

The general guideline regarding this to create `XRequests.ts` files for each backend service that the app talks to and
group all requests from the same service into the same file.

An example of the usage both on client-side and server-side rendering can be seen in the [sample index page](./pages/index.tsx).

By default an instance of the `Api` class is provided at the root of the application as seen in [`_app.tsx`](./pages/_app.tsx). This
instance can be retrieved in any component in the application using the [`useApi`](./hooks/useApi.ts) hook:

```tsx
function SomeComponent() {
    const [countries, setCountries] = useState([]);
    const api = useApi();

    useEffect(() => {
        const fetchCountries = async () => {
            const response = await api.performRequest(CountriesRequests.getAllCountries());

            setCountries(response);
        };

        fetchCountries();
    }, []);

    ...
}
```

If, for any reason, a different API is required to be used (i.e. using a different auth provider or base URL) a new instance can be
created and hoisted in the component hierarchy using [`ApiProvider`](./providers/ApiProvider.tsx):

```tsx
function SomeOtherApiParent() {
    return (
        <ApiProvider baseUrl="http://some-other-api" authProvider={new SomeOtherAuthProvider()}>
            ...
        </ApiProvider>
    );
}
```

This is akin to dependency injection where the dependency is resolved from the nearest provider in the hierarchy.
In this situation, the `useApi` hook in child components will resolve the `Api` instance from the nearest
context in the hierarchy.

### Authenication state

An authentication context has been setup that can be used to track the user authentication state
of the application. The template contains a very basic `User` model, and the presence of a `User` object
is used to determine whether the app is authenticated or not. This functionality can be extended
as required by each project.

Refer to [`AuthProvider`](./src/providers/auth_provider.tsx) (not to be confused with [`IAuthProvider`](./src/interfaces/auth_provider.ts) which is a wrapper for the auth backends used in the app such as AWS Cognito or Firebase).

### React Router

The project has been setup with `react-router` v6. There are two collections of base routes setup in
[authenticated_routes](./src/routes/authenticated_routes.tsx) and [unauthenticated_routes](./src/routes/unauthenticated_routes.tsx). Add new routes
for the app as relevant to these files. The collection displayed changes based on the authentication
state in the app.

### Bundle Splitting

Bundle splitting can be accomplished by using the `import()` method provided by Webpack. More details
can be found in Webpack's documentation

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

### Internationalisation

The project has been setup with `react-i18next` and more information on how to work with it can
be found in their official documentation.

## Production

For production deployment, a Docker configuration is included to build an image containing all the necessary steps to
release the app to production. This image can then be deployed to a server or in a cluster to serve the app to users.

Ensure that the correct values are set in the `.env` file in the root of the repository containing the configuration
for the production build.

The app will run in the container on port 8080.
