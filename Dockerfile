# THIS IS A SINGLE CONTAINER FOR THE BACKEND, FRONTEND, AND NGINX. 
# IF YOU WANT TO USE MULTIPLE CONTAINERS, USE THE DOCKER COMPOSE FILE INSTEAD!

FROM nikolaik/python-nodejs:python3.11-nodejs20-slim

# --- Configure the Backend Python Service ---

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

RUN curl -sSL https://install.python-poetry.org | python3 -

WORKDIR /app/backend

COPY backend/pyproject.toml backend/poetry.lock ./

RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

COPY backend .

# --- Configure the Frontend Service ---

WORKDIR /app/frontend

# Set the environment variables for the frontend
ENV VITE_APP_BACKEND_API_URL=http://0.0.0.0:6969
ENV VITE_APP_APP_URL=http://localhost:4200
ENV VITE_APP_BACKEND_API_VERSION=api/v1/

# Install the dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend .

# --- Configure the NGINX Proxy ---

RUN apt-get update && apt-get install -y nginx

COPY proxy/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

# --- Start the Services ---

CMD nginx -t && \
    service nginx start && \
    cat /var/log/nginx/error.log && \
    cd /app/backend && python manage.py runserver 0.0.0.0:6969 & \
    cd /app/frontend && npm run dev & \
    tail -f /dev/null
    