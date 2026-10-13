FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /srv
RUN mkdir -p /srv/work /srv/site && chown -R node:node /srv
COPY builder.mjs ./
USER node
CMD ["node", "builder.mjs"]
