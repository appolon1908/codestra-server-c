FROM node:22.22.2-alpine3.23 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_ENDPOINT
ARG VITE_PUBLIC_DEMO_PHONE
ARG VITE_PUBLIC_SALES_PHONE
ARG VITE_PUBLIC_SITE_URL
ENV VITE_API_ENDPOINT=${VITE_API_ENDPOINT}
ENV VITE_PUBLIC_DEMO_PHONE=${VITE_PUBLIC_DEMO_PHONE}
ENV VITE_PUBLIC_SALES_PHONE=${VITE_PUBLIC_SALES_PHONE}
ENV VITE_PUBLIC_SITE_URL=${VITE_PUBLIC_SITE_URL}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine

ARG VCS_REF=unknown
ARG IMAGE_VERSION=unknown
LABEL org.opencontainers.image.source="https://github.com/Codestra-SRL/codestra-server-c" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.version="${IMAGE_VERSION}" \
      org.opencontainers.image.title="Codestra Server C frontend"

USER root
RUN apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
