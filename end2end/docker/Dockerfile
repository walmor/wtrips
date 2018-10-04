FROM cypress/base:8

WORKDIR /end2end

COPY package.json yarn.* ./

RUN yarn install && yarn cache clean
