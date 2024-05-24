FROM node:alpine

COPY package*.json .

RUN npm i --only=production

COPY index.js .

CMD ["node", "index.js"]