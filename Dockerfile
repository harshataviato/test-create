# Use official Node.js Alpine image for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose the application port
EXPOSE 3000

# Environment variable defaults
ENV NODE_ENV=production
ENV DB_DIALECT=sqlite
ENV DB_STORAGE=/app/database.sqlite

# Run migrations/seed (optional check) and start
# Note: In production, seeding is usually a separate job
CMD ["npm", "start"]
