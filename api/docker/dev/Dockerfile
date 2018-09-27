FROM node:8.12.0-alpine

RUN apk --no-cache add --virtual builds-deps build-base python yarn git

WORKDIR /app/api

COPY package.json yarn.lock ./

RUN yarn install && npm rebuild bcrypt --build-from-source && yarn cache clean

EXPOSE 9229 9230
