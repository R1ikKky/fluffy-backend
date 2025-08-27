FROM node:22

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npx nx build api-gateway

ENV PORT=3000

EXPOSE 3000

CMD [ "npx", "nx", "serve", "api-gateway" ]