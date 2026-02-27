# Cloud-Native: Multi-stage build for small footprint
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Environment variables for production
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]
