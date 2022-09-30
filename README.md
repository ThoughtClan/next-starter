# React Templates

This repository contains a collection of project templates for different React project setups.
They are based on standard templates created by Create React App and NextJS that have been enhanced for custom needs.

Each template has its own README within its subdirectory containing instructions on how to use it and details specific to that template.

## General Guidelines

While each template has its own guidelines to be followed, the general folder structure guideline for all projects is as follows:
- `api`: contains all API integration related modules
- `components`: common components shared between multiple screens
- `contexts`: various React contexts used in the application
- `enums`: enums defining various static values, for ex. user roles
- `errors`: custom errors
- `hooks`: custom hooks
- `interfaces`: self explanatory; interfaces desribing object functionality
- `pages`/`routes`: called `pages` in NextJS projects and `routes` otherwise, contains components that represent a whole page in the application
- `providers`: HoCs that hoist a particular context for a subtree
- `public`: static assets
- `store`: redux store, reducers, middlewares, sagas etc.
- `styles`: shared stylesheets (can be ignored if using CSS-in-JS)
- `types`: data types used to desribe various entities in the app

All files should be either `.ts` files or `.tsx` files if they contain JSX. Avoiding adding `.js` files.

Filenames should also all be `lower_snake_cased` with the exception of hooks which follow the `useHook` naming pattern.

Modules like hooks, enums etc. should always export only a single member representing the filename.
