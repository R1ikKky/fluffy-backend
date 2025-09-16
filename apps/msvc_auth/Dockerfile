FROM node:22

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

RUN npx nx build msvc_auth

ENV PORT=8080
EXPOSE 8080

CMD [ "npx", "nx", "serve", "msvc_auth" ]
