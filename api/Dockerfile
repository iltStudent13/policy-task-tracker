FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# Stage 2 runtime
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm install --omit=dev && npm cache clean --force
EXPOSE 4000

CMD ["node", "dist/server.js"]
