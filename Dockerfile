FROM nginx:stable-alpine AS base
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
RUN rm -rf /usr/share/nginx/html/*
COPY start.sh /

FROM node:iron-alpine AS builder
COPY package*.json /configcat-trello-powerup/
WORKDIR /configcat-trello-powerup
RUN npm install
COPY ./ /configcat-trello-powerup/
RUN npm run build

FROM base AS final
COPY --from=builder /configcat-trello-powerup/dist/configcat-trello-powerup /usr/share/nginx/html
CMD ["sh", "start.sh"]