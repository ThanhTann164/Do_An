# Backend Dockerfile
# Note: This Dockerfile should be built from the project root directory
# Build command: docker build -f BE/Dockerfile -t home_x_backend .

FROM node:18-alpine

# Install mysql-client for health checks and database operations
RUN apk add --no-cache mysql-client bash

# Set working directory
WORKDIR /app

# Copy package files (package.json is at root level)
COPY package*.json ./

# Install dependencies (including dev dependencies for scripts)
RUN npm install

# Copy backend source code
COPY BE/ ./BE/

# Copy database migrations (directory exists in project)
COPY database/ ./database/

# Note: config.env is mounted as volume in docker-compose.yml
# If you need to copy it during build, uncomment the line below:
# COPY config.env* ./

# Copy and set permissions for entrypoint script
COPY BE/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create uploads directory with proper permissions
RUN mkdir -p BE/uploads/avatars BE/uploads/chat-images && \
    chmod -R 755 BE/uploads

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/test || exit 1

# Use entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

