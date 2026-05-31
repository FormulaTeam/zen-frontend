# ============================================================
# Stage 1: Base
#   Shared OS deps for fetching packages
# ============================================================
FROM node:20-slim AS base

# Install git and ca-certificates required for npm to install from GitHub
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ============================================================
# Stage 2: Dependencies
#   Install ALL dependencies using secure GitHub token mount
# ============================================================
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json .npmrc ./

# Securely mount the GitHub token. This rewrites your formula-gear ssh:// URL 
# to use the token securely without baking keys into the image layers.
RUN --mount=type=secret,id=GH_TOKEN \
    export GITHUB_TOKEN=$(cat /run/secrets/GH_TOKEN) && \
    git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/" && \
    git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "git@github.com:" && \
    git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/".insteadOf "ssh://git@github.com/" && \
    npm ci

# ============================================================
# Stage 3: Build the React application
# ============================================================
FROM deps AS build
WORKDIR /app

# Copy source code and config files needed for the build
# (node_modules are already present from the 'deps' stage)
COPY craco.config.js tsconfig.json declaration.d.ts ./
COPY public ./public
COPY src ./src

# Build the production bundle
RUN npm run build

# ============================================================
# Stage 4: Production runtime with Nginx
# ============================================================
FROM nginx:1.27-alpine AS runner

# Install Node.js (needed for runtime-env.js at container startup)
RUN apk add --no-cache nodejs

# Remove the default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the runtime environment script
COPY runtime-env.js /usr/share/nginx/html/

# Copy the production build output
COPY --from=build /app/build /usr/share/nginx/html

# Grant permissions so the container can run as a non-root user
# belonging to the root group (common in OpenShift / restricted environments)
RUN chgrp -R 0 /usr/share/nginx/html \
        /var/cache/nginx \
        /var/run \
        /var/log/nginx \
        /etc/nginx/conf.d && \
    chmod -R g=u /usr/share/nginx/html \
        /var/cache/nginx \
        /var/run \
        /var/log/nginx \
        /etc/nginx/conf.d && \
    chmod a+rw /usr/share/nginx/html/runtime-env.js

# Expose the port Nginx listens on (matches nginx.conf)
EXPOSE 3001

CMD ["/bin/sh", "-c", "node /usr/share/nginx/html/runtime-env.js && nginx -g 'daemon off;'"]