# Docker Setup Guide

This guide explains how to use the improved Docker configuration for the Ollama WebUI application.

## 🚀 Quick Start

### Development Environment

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Start the development environment:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:6969
   - Proxy: http://localhost:5073

### Production Environment

```bash
docker-compose -f compose.yaml -f compose.prod.yaml up --build -d
```

## 🏗️ Architecture

The Docker setup includes:

- **Backend**: Django REST API with Poetry dependency management
- **Frontend**: React application built with Bun
- **Database**: PostgreSQL for data persistence
- **Cache**: Redis for session storage and caching
- **Proxy**: Nginx reverse proxy with SSL termination

## 🔒 Security Features

### Non-Root Users
Most containers run as non-root users for enhanced security:
- Backend: `django` user (UID 1000)
- Frontend: `bun` user (UID 1000, pre-existing in Bun image)
- Frontend (production): `nginx-app` user (UID 1001)
- Proxy: runs as root (standard nginx configuration, isolated from other services)

### Corporate Environment Support
The setup supports corporate environments that require custom CA certificates:

1. Place your `.crt` files in:
   - `backend/docker/ca-certificates/`
   - `frontend/docker/ca-certificates/`

2. Set environment variables:
   ```bash
   INSTALL_CA_CERTS=true
   CA_CERTS_PATH=./docker/ca-certificates
   ```

### Security Headers
Nginx is configured with security headers:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

## 🌐 Network Architecture

Custom Docker networks provide isolation:
- `frontend`: Frontend ↔ Proxy communication
- `backend`: Backend ↔ Proxy communication
- `db`: Backend ↔ Database communication

## 💾 Data Persistence

Named volumes ensure data persistence:
- `postgres_data`: Database files
- `redis_data`: Cache data
- `backend_staticfiles`: Django static files
- `backend_media`: User uploads

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
# Corporate environment
INSTALL_CA_CERTS=false
CA_CERTS_PATH=./docker/ca-certificates

# Database
POSTGRES_DB=ollama_webui
POSTGRES_USER=ollama_user
POSTGRES_PASSWORD=change_me_in_production

# Application
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
```

### Multi-Stage Builds

Each service uses multi-stage Docker builds:

#### Backend Stages
- `python-base`: Base Python environment with CA cert support
- `deps-builder`: Poetry dependency installation
- `development`: Development runtime
- `production`: Production runtime with Gunicorn

#### Frontend Stages
- `base`: Base Bun environment with CA cert support
- `deps`: Dependency installation
- `builder`: Build assets
- `development`: Development server
- `production`: Nginx serving static files

## 🏥 Health Checks

All services include health checks:
- **Backend**: `GET /api/health/`
- **Frontend**: `GET /`
- **Database**: `pg_isready`
- **Redis**: `redis-cli ping`
- **Proxy**: `GET /health`

## 🔄 Development Workflow

### Hot Reloading
Development containers mount source code volumes for hot reloading:
- Backend: API changes reload automatically
- Frontend: Vite dev server with file watching

### Development Commands

```bash
# Start with hot reloading
docker-compose -f compose.yaml -f compose.dev.yaml up

# Build without cache
docker-compose build --no-cache

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in containers
docker-compose exec backend python manage.py shell
docker-compose exec frontend bun install
```

## 🚀 Production Deployment

### Prerequisites
1. Set production environment variables
2. Configure proper secrets management
3. Set up external load balancer (optional)
4. Configure domain and SSL certificates

### Deployment Steps

1. **Prepare environment:**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Deploy:**
   ```bash
   docker-compose -f compose.yaml -f compose.prod.yaml up -d
   ```

3. **Database setup is automatic:**
   The backend container now automatically handles:
   - Database migrations
   - Superuser creation
   - Fixture loading
   
   If you need to manually run migrations:
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   ```

## 🛠️ Troubleshooting

### Common Issues

1. **Certificate Issues in Corporate Environment:**
   ```bash
   # Verify CA certificates are copied
   docker-compose exec backend ls -la /usr/local/share/ca-certificates/
   
   # Check certificate installation
   docker-compose exec backend update-ca-certificates
   ```

2. **Port Conflicts:**
   ```bash
   # Change ports in .env file
   BACKEND_PORT=6970
   FRONTEND_PORT=4201
   PROXY_HTTP_PORT=5074
   ```

3. **Database Connection Issues:**
   ```bash
   # Check database health
   docker-compose exec db pg_isready -U ollama_user
   
   # Reset database
   docker-compose down -v
   docker-compose up -d db
   ```

4. **Build Issues:**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -a
   docker-compose build --no-cache
   ```

### Debugging

```bash
# Enter container for debugging
docker-compose exec backend bash
docker-compose exec frontend bash

# Check container logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend

# Monitor resource usage
docker stats
```

## 📊 Monitoring

### Health Check Status
```bash
# Check all service health
docker-compose ps

# Test health endpoints directly
curl http://localhost:6969/api/health/
curl http://localhost:4200/
curl http://localhost:5073/health
```

### Performance Monitoring
```bash
# Resource usage
docker stats

# Container inspection
docker-compose exec backend python manage.py check --deploy
```

## 🔄 Updates and Maintenance

### Updating Dependencies

#### Backend (Poetry)
```bash
docker-compose exec backend poetry update
docker-compose restart backend
```

#### Frontend (Bun)
```bash
docker-compose exec frontend bun update
docker-compose restart frontend
```

### Database Maintenance
```bash
# Backup
docker-compose exec db pg_dump -U ollama_user ollama_webui > backup.sql

# Restore
docker-compose exec -T db psql -U ollama_user ollama_webui < backup.sql
```

## 📝 Best Practices

1. **Always use `.env` files** for configuration
2. **Regular backups** of database and media files
3. **Monitor health checks** in production
4. **Use specific image tags** instead of `latest` in production
5. **Implement proper logging** and monitoring
6. **Regular security updates** of base images
7. **Test in staging environment** before production deployment

## 🆘 Support

For issues specific to the Docker setup, check:
1. Container logs: `docker-compose logs [service]`
2. Health check status: `docker-compose ps`
3. Network connectivity: `docker network ls`
4. Volume mounts: `docker volume ls` 