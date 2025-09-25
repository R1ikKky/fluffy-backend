FROM node:22

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

RUN npx nx build msvc_user

ENV PORT=3002
EXPOSE 3002

CMD [ "npx", "nx", "serve", "msvc_user" ]
