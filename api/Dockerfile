FROM node:8.12.0-alpine as dev

RUN apk --no-cache add build-base python yarn git

WORKDIR /app

COPY package.json yarn.* ./

RUN yarn install && npm rebuild bcrypt --build-from-source && yarn cache clean


FROM dev as build

COPY . /app

RUN yarn build


FROM node:8.12.0-alpine as release

WORKDIR /app

COPY --from=dev /app/package.json /app/yarn.* ./
COPY --from=dev /app/node_modules ./node_modules
COPY --from=build /app/build ./

CMD ["node", "server.js"]
