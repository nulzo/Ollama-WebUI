# Simple nginx proxy for local development
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx configuration
COPY nginx.compose.conf /etc/nginx/conf.d/default.conf

# Expose port (HTTP only for local development)
EXPOSE 5073

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5073/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
