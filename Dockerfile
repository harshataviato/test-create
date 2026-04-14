# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
# This allows for caching node_modules layer if dependencies haven't changed
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
# This is the default command, can be overridden by docker-compose.yml
CMD ["npm", "start"]
