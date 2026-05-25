FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci
RUN npx prisma generate
RUN npm prune --omit=dev

COPY src ./src/

ENV NODE_ENV=production

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
