FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN apt-get install unzip

COPY . .




EXPOSE 8080
CMD [ "node", "index.js" ]
