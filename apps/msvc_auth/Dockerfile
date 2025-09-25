FROM node:22

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

RUN npx nx build msvc_auth

ENV PORT=3001
EXPOSE 3001

CMD [ "npx", "nx", "serve", "msvc_auth" ]
