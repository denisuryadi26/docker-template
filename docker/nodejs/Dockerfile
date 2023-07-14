FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY docker/nodejs/package*.json ./
COPY docker/nodejs/config ./
COPY docker/nodejs/uploads ./
COPY docker/nodejs/utils ./
COPY docker/nodejs/index.js ./
COPY docker/nodejs/server.js ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY docker/nodejs/. .

EXPOSE 3000
ARG DOCKER_ENV
ENV NODE_ENV=dev
#CMD [ "node", "index.js" ]
CMD ["node", "server.js"]
