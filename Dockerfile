# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# ---- Stage 2: Migrator (prisma migrate deploy) ----
FROM node:20-alpine AS migrator
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN node node_modules/prisma/build/index.js generate

CMD ["node", "node_modules/prisma/build/index.js", "migrate", "deploy"]

# ---- Stage 3: Build & Run ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
