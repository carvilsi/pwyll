FROM node:alpine

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN mkdir -p /usr/pwyll
WORKDIR /usr/pwyll
COPY . /usr/pwyll/

RUN npm install -g npm
RUN npm install
RUN npm install typescript -g
RUN npm run build
CMD npm start

