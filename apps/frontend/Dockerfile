# Multi-stage build for Frontend

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY public ./public
COPY src ./src

# Build application
RUN npm run build

# Stage 2: Runtime with Nginx
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
