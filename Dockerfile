# Dockerfile for the PetClinic Node.js application

# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# This means npm install will only run if dependencies change
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Add a script to initialize the database (schema and data)
# This script will be run by the docker-compose.yml entrypoint
COPY init-db.sh /app/init-db.sh
RUN chmod +x /app/init-db.sh

# The command to run the application is specified in docker-compose.yml
# For direct docker run, you would use: CMD ["npm", "start"]
