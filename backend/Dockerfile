FROM python:3.11-slim AS python-base

ARG DEBUG
ARG SECRET_KEY
ARG DJANGO_SUPERUSER_PASSWORD
ARG DJANGO_SUPERUSER_USERNAME
ARG DJANGO_SUPERUSER_EMAIL
ARG OLLAMA_HOST
ARG OLLAMA_PORT
ARG OPENAI_API_KEY

# Set environment variables
ENV DEBUG=$DEBUG \
    SECRET_KEY=$SECRET_KEY \
    DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME:-admin} \
    DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD:-password} \
    DJANGO_SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL:-admin@example.com} \
    OLLAMA_HOST=${OLLAMA_HOST:-host.docker.internal} \
    OLLAMA_PORT=${OLLAMA_PORT:-11434} \
    OPENAI_API_KEY=${OPENAI_API_KEY}


# Environment variables for Python and Django
ENV PYTHONUNBUFFERED=1 \
    # Preventing Python from creating .pyc files
    PYTHONDONTWRITEBYTECODE=1 \
    # Set up pip configurations
    PIP_NO_CACHE_DIR=off \
    # No need to check pip since we are pulling from image
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    # Increasing timeout for pip so we don't timeout
    PIP_DEFAULT_TIMEOUT=1000 \
    # Installing Poetry. See here to get a better idea vvv
    # https://python-poetry.org/docs/configuration/#using-environment-variables
    POETRY_VERSION=1.8.3 \
    # make poetry install to this location
    POETRY_HOME="/opt/poetry" \
    # Create poetry virtual environment within the poetry root and
    # implicitly giving the virtual environment the .venv name 
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # Runs the poetry installer without interaction from user
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"


# Prepend poetry and the virtual environment to the path
ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# "builder-base" is used here to compile dependencies and 
# will be used to create the virtual environment
FROM python-base AS builder-base
# Update apt if needed
RUN apt-get update \
# Install apt with no output and pass yes to all prompts
    && apt-get install --no-install-recommends -y \
        # Curl is required for installing Poetry to the container
        curl \
        # Build-Essential is required for building Python dependencies (such as gcc and cffi)
        build-essential

# Install poetry using Curl to the $POETRY_VERSION and $POETRY_HOME paths
RUN curl -sSL https://install.python-poetry.org | python3 -

WORKDIR /home/backend/

# Copy the pyproject.toml file (our dependencies) to the container
# (Don't copy over the lock file - we wanto to generate that within the container)
COPY pyproject.toml poetry.lock* ./

# Install poetry dependencies to the virtual environment created earlier
# Should probably pass in the --no-dev flag at some point during prod build
# i.e. `poetry install --no-interaction --no-cache`
RUN poetry config virtualenvs.create true \
    && poetry config virtualenvs.in-project true \
    && poetry install

# Send the contents of the main backend directory to the container so that
# it follows the same directory structure as the project
COPY settings ./settings

# Copy the core of the root backend into the container 
# (Look at the .dockerignore file to see what does not get sent over)
COPY . .

# Expose the port to the container
EXPOSE "$PORT"

RUN poetry run python manage.py makemigrations
RUN poetry run python manage.py migrate

RUN poetry run python manage.py createsuperuser --noinput

# Start the Django backend server on port 6969.
# Running this command with "0.0.0.0:PORT" allows us to tell Docker that
# we want this application to be exposed through the Docker DNS bridge.
# It allows our application to be seen *outside* of Docker, and gives us 
# the ability to run it via localhost on our main machine.
CMD ["poetry", "run", "uvicorn", "settings.asgi:application", "--host", "0.0.0.0", "--port", "6969"]
