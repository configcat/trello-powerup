FROM nginxinc/nginx-unprivileged:stable-alpine AS base
USER root
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY start.sh /
RUN sed -i 's/\r//' /start.sh

FROM node:24.15-alpine AS builder
COPY package*.json /configcat-trello-powerup/
WORKDIR /configcat-trello-powerup
RUN npm install
COPY ./ /configcat-trello-powerup/
ENV NG_BUILD_OPTIMIZE_CHUNKS=false
RUN npm run build

FROM base AS final
ARG UID=101
USER root
COPY --from=builder /configcat-trello-powerup/dist/configcat-trello-powerup /usr/share/nginx/html
COPY _headers /usr/share/nginx/html/
RUN chown -R "$UID":0 /usr/share/nginx/html /etc/nginx \
    && chmod -R u+rwx,g+rwx /usr/share/nginx/html /etc/nginx
USER $UID
EXPOSE 8080
CMD ["sh", "start.sh"]