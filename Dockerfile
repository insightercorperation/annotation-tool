FROM node:10.15.2

RUN apt-get -y update
RUN apt-get -y upgrade

RUN npm install pm2 -g

WORKDIR /uploads
WORKDIR /app
COPY . .
RUN yarn install
RUN cd client && yarn install
RUN cd server && yarn install
RUN cd client && yarn build

ENV UPLOADS_PATH=/uploads

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD pm2-runtime server/src/index.js
