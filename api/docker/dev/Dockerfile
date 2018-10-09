FROM node:8.12.0-alpine

RUN apk --no-cache add build-base python yarn git

WORKDIR /app/api

COPY package.json yarn.* ./

RUN yarn install && npm rebuild bcrypt --build-from-source && yarn cache clean
