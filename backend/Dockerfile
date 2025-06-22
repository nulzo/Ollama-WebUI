# Multi-stage build for Django backend with Poetry
ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim as python-base

# Build arguments for corporate environment support
ARG INSTALL_CA_CERTS=false
ARG CA_CERTS_PATH=""

# Python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.8.3 \
    POETRY_HOME="/opt/poetry" \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_VIRTUALENVS_CREATE=true \
    POETRY_NO_INTERACTION=1

# Install system dependencies and create non-root user
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 1000 django \
    && useradd --uid 1000 --gid django --shell /bin/bash --create-home django

# Install custom CA certificates if provided
COPY docker/ca-certificates* /tmp/
RUN if [ "$INSTALL_CA_CERTS" = "true" ] && [ -n "$CA_CERTS_PATH" ]; then \
        cp /tmp/ca-certificates/* /usr/local/share/ca-certificates/ 2>/dev/null || true; \
        update-ca-certificates; \
        # Update pip's certificates
        python -m pip config set global.cert /etc/ssl/certs/ca-certificates.crt; \
    fi

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - \
    && ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry

# Build stage for dependencies
FROM python-base as deps-builder

WORKDIR /app

# Copy Poetry configuration
COPY pyproject.toml poetry.lock ./

# Configure Poetry and install dependencies
RUN poetry config virtualenvs.create true \
    && poetry config virtualenvs.in-project true \
    && poetry install --no-root --no-dev \
    && rm -rf $POETRY_CACHE_DIR

# Development stage
FROM python-base as development

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=deps-builder /app/.venv /app/.venv

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy and set permissions for entrypoint script (before switching to non-root user)
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy application code
COPY --chown=django:django . .

# Create required directories
RUN mkdir -p /app/staticfiles /app/media \
    && chown -R django:django /app

# Switch to non-root user
USER django

# Expose port
EXPOSE 6969

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:6969/api/health/ || exit 1

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Development command (can be overridden)
CMD ["python", "manage.py", "runserver", "0.0.0.0:6969"]

# Production stage
FROM python-base as production

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=deps-builder /app/.venv /app/.venv

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Install additional production dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Copy and set permissions for entrypoint script (before switching to non-root user)
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy application code
COPY --chown=django:django . .

# Create required directories and collect static files
RUN mkdir -p /app/staticfiles /app/media \
    && chown -R django:django /app

# Switch to non-root user
USER django

# Expose port
EXPOSE 6969

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:6969/api/health/ || exit 1

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Production command
CMD ["gunicorn", "--bind", "0.0.0.0:6969", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "settings.asgi:application"]
