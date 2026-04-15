FROM node:25-trixie-slim AS build

WORKDIR /app
COPY gitnexus-shared ./gitnexus-shared
COPY gitnexus ./gitnexus

RUN cd gitnexus-shared && npm ci && npm run build
RUN cd gitnexus && npm ci && npm run build

FROM node:25-trixie-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/gitnexus
ENV NODE_ENV=production

COPY --from=build /app/gitnexus/package*.json ./
COPY --from=build /app/gitnexus/node_modules ./node_modules
COPY --from=build /app/gitnexus/dist ./dist
COPY --from=build /app/gitnexus/hooks ./hooks
COPY --from=build /app/gitnexus/scripts ./scripts
COPY --from=build /app/gitnexus/skills ./skills
COPY --from=build /app/gitnexus/vendor ./vendor

WORKDIR /workspace
EXPOSE 4747

CMD ["sh", "-lc", "node /app/gitnexus/dist/cli/index.js analyze --skip-agents-md /workspace && exec node /app/gitnexus/dist/cli/index.js serve --host 0.0.0.0 --port 4747"]
