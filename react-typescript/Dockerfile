### STAGE 1: Build ###
FROM node:16.14.2 as ui-pwa-build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package.json /app/
COPY ./yarn.lock /app/
COPY ./config/nginx/nginx.conf /app/nginx.conf
RUN yarn --silent
COPY . /app
### TODO: Add back ESTLINT checks ###
RUN DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false yarn build


### STAGE 2: Production Environment ###
FROM nginxinc/nginx-unprivileged:1.20
COPY --from=ui-pwa-build /app/build /usr/share/nginx/html
COPY --from=ui-pwa-build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
