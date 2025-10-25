FROM node:22

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

RUN npx nx build msvc_message

ENV PORT=3003
EXPOSE 3003

CMD [ "npx", "nx", "serve", "msvc_message" ]
