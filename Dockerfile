# Stage 1: Build the React app
FROM node:20-slim AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy-peer-deps flag
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the app with Nginx and Node.js
FROM nginx:alpine

# Install Node.js
RUN apk add --no-cache nodejs npm

# Support running as arbitrary user which belongs to the root group
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf /usr/share

# Add the env variables file to the working directory
COPY runtime-env.js /usr/share/nginx/html/

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/build /usr/share/nginx/html

# Expose ports
EXPOSE 8080
EXPOSE 80
EXPOSE 443

# Set permissions
RUN chgrp -R 0 /usr/share/nginx/html/ && \
    chmod -R g=u /usr/share/nginx/html/
RUN chmod a+rwx /usr/share/nginx/html/
RUN chmod a+rw /usr/share/nginx/html/runtime-env.js

# Start Nginx server with a script to run environment setup
CMD [ "/bin/sh", "-c", "node /usr/share/nginx/html/runtime-env.js && nginx -g 'daemon off;'" ]
