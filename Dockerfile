# --- Stage 1: Build the React App ---
# Use a Node.js base image for building the app.
FROM node:22-alpine AS builder

# Set the working directory inside the container.
WORKDIR /app

# Copy the package.json and package-lock.json files first.
# This allows Docker to use caching if dependencies haven't changed.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application source code.
COPY . .

# Build the production-ready application.
# The output will be in the `dist` directory.
RUN npm run build

# --- Stage 2: Serve the App with Nginx ---
# Use a lightweight Nginx base image to serve the static files.
FROM nginx:stable-alpine

# Copy the custom Nginx configuration file into the container.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the 'builder' stage to the Nginx server's
# web root directory.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world.
EXPOSE 80