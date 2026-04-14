# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json and package-lock.json are copied
COPY package*.json ./

RUN npm install

# Copy app source code into the container
COPY src /app/src

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
# This is for production. For development, `npm run dev` might be used with nodemon.
CMD ["npm", "start"]
