FROM node:22-alpine

WORKDIR /app
COPY package.json server.mjs ./

# Журнал донатов живёт на volume; непривилегированный пользователь node уже есть в образе.
ENV DONATIONS_LOG_PATH=/data/donations.jsonl
RUN mkdir -p /data && chown node:node /data /app
VOLUME /data

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["node", "server.mjs"]
