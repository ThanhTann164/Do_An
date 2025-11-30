# Frontend Dockerfile - Multi-stage build
# Note: This Dockerfile should be built from the project root directory
# Build command: docker build -f FE/Dockerfile -t home_x_frontend .

# Stage 1: Build the Vite app
FROM node:20-alpine AS builder

WORKDIR /app/FE

# Copy package files first
COPY FE/package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy frontend source code (package.json already copied, so this won't overwrite)
COPY FE/ ./

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY FE/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/FE/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

