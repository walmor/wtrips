FROM node:8.12.0-alpine

RUN apk --no-cache add yarn git

WORKDIR /app/web

COPY package.json yarn.* ./

RUN yarn install && yarn cache clean

EXPOSE 9229 9230