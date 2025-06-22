# Multi-stage build for React frontend with Bun
ARG BUN_VERSION=1
FROM oven/bun:${BUN_VERSION} as base

# Build arguments for corporate environment support
ARG INSTALL_CA_CERTS=false
ARG CA_CERTS_PATH=""

# Install system dependencies (bun user already exists in the base image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install custom CA certificates if provided
COPY docker/ca-certificates* /tmp/
RUN if [ "$INSTALL_CA_CERTS" = "true" ] && [ -n "$CA_CERTS_PATH" ]; then \
        cp /tmp/ca-certificates/* /usr/local/share/ca-certificates/ 2>/dev/null || true; \
        update-ca-certificates; \
        # Configure bun to use the CA bundle
        export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt; \
    fi

# Dependencies stage
FROM base as deps

WORKDIR /app

# Copy package configuration
COPY package.json bun.lockb* ./

# Install dependencies (including dev dependencies)
RUN bun install --frozen-lockfile

# Build stage
FROM base as builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_APP_BACKEND_API_URL=""
ARG VITE_APP_APP_URL="http://localhost:4200"
ARG VITE_APP_BACKEND_API_VERSION="api/v1/"

# Set build-time environment variables
ENV VITE_APP_BACKEND_API_URL=${VITE_APP_BACKEND_API_URL}
ENV VITE_APP_APP_URL=${VITE_APP_APP_URL}
ENV VITE_APP_BACKEND_API_VERSION=${VITE_APP_BACKEND_API_VERSION}

# Build Tailwind CSS
RUN bunx tailwindcss -i ./src/style/globals.css -o ./src/style/output.css --minify

# Build the application (commented out for development)
# RUN bun run build

# Development stage
FROM base as development

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY --chown=bun:bun . .

# Create required directories
RUN mkdir -p /app/dist \
    && chown -R bun:bun /app

# Switch to non-root user
USER bun

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:4200/ || exit 1

# Development command
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]

# Production stage
FROM nginx:alpine as production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for nginx (use different UID to avoid conflicts)
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-app -g nginx-app nginx-app

# Change ownership of nginx directories
RUN chown -R nginx-app:nginx-app /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx-app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
