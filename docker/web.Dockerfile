FROM node:20-bookworm-slim AS build

WORKDIR /app
COPY gitnexus-shared ./gitnexus-shared
COPY gitnexus ./gitnexus
COPY gitnexus-web ./gitnexus-web

RUN cd gitnexus-shared && npm ci && npm run build
RUN cd gitnexus-web && npm ci && npm run build

FROM nginx:1.29-alpine
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/gitnexus-web/dist /usr/share/nginx/html
EXPOSE 80
