# Start with a base image that includes both Python and Node.js
FROM nikolaik/python-nodejs:python3.11-nodejs20-slim

# Install NGINX
RUN apt-get update && apt-get install -y nginx

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=1000 \
    POETRY_VERSION=1.6.1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv" \
    DEBUG=True \
    SECRET_KEY=fkwsueyfgsekfg \
    DJANGO_SUPERUSER_PASSWORD=test \
    DJANGO_SUPERUSER_USERNAME=test \
    DJANGO_SUPERUSER_EMAIL=test@test.com \
    PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Set up backend
WORKDIR /app/backend
COPY backend/pyproject.toml ./
RUN poetry install
COPY backend .

# Set up frontend
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend .

# Set up NGINX
COPY proxy/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 8008

# Start services
CMD nginx -t && \
    service nginx start && \
    cat /var/log/nginx/error.log && \
    cd /app/backend && poetry run python manage.py runserver 0.0.0.0:6969 & \
    cd /app/frontend && npm run dev & \
    tail -f /dev/null