FROM node:lts-slim
WORKDIR /app
COPY package*.json .
RUN npm i
RUN apt-get update -y && apt-get install netcat-openbsd -y
COPY . .
EXPOSE 3000
