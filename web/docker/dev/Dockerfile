FROM node:8.12.0-alpine

RUN apk --no-cache add --virtual yarn git

WORKDIR /app/web

COPY package.json yarn.lock ./

RUN yarn install && yarn cache clean

EXPOSE 9229 9230