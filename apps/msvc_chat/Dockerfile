FROM node:22

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

RUN npx nx build msvc_chat

ENV PORT=3004
EXPOSE 3004

CMD [ "npx", "nx", "serve", "msvc_chat" ]
