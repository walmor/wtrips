FROM node:8.12.0-alpine as dev

RUN apk --no-cache add yarn git

WORKDIR /app

COPY package.json yarn.* ./

RUN yarn install && yarn cache clean


FROM dev as build

COPY . .

RUN yarn build


FROM nginx:1.15.5-alpine as release

COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx.template.conf /etc/nginx/conf.d/nginx.template

CMD envsubst "`env | awk -F = '{printf \" $$%s\", $$1}'`" \
  < /etc/nginx/conf.d/nginx.template \
  > /etc/nginx/conf.d/default.conf \
  && exec nginx -g 'daemon off;'