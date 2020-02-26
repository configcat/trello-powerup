FROM nginx:alpine AS base
RUN rm -rf /usr/share/nginx/html/*
COPY start.sh /

FROM node:alpine AS builder
COPY package*.json /configcat-trello-powerup/
WORKDIR /configcat-trello-powerup
RUN npm install
COPY ./ /configcat-trello-powerup/
RUN npm run build

FROM base as final
COPY --from=builder /configcat-trello-powerup/dist/configcat-trello-powerup /usr/share/nginx/html
CMD ["sh", "start.sh"]