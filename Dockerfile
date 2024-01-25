FROM node:alpine

RUN mkdir -p /usr/commander
WORKDIR /usr/commander
COPY . /usr/commander/

RUN npm install -g npm
RUN npm install
RUN npm install typescript -g
RUN npm run build
RUN export NODE_ENV=test
CMD npm start
