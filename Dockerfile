# Stage 1: Build the NestJS application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock (or package-lock.json)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock (or package-lock.json) for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/views ./views
COPY --from=build /app/public ./public
COPY --from=build /app/src/i18n/messages ./dist/i18n/messages # Copy i18n message files
COPY --from=build /app/src/config/typeorm.config.ts ./dist/config/typeorm.config.ts # For migrations in container
COPY --from=build /app/src/config/seed.ts ./dist/config/seed.ts # For seeding in container
COPY --from=build /app/node_modules/typeorm/cli.js ./node_modules/typeorm/cli.js # For typeorm CLI in container

# Expose the port the application runs on
EXPOSE 3000

# Command to run the application (overridden by docker-compose for migrations/seeds)
CMD ["node", "dist/main"]
