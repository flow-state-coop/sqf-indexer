FROM node:lts

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY src src
COPY tsconfig.json ./

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
