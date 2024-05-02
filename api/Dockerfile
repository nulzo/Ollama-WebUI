FROM python:3.11-slim as python-base

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
    POETRY_VERSION=1.6.1 \
    # make poetry install to this location
    POETRY_HOME="/opt/poetry" \
    # Create poetry virtual environment within the poetry root and
    # implicitly giving the virtual environment the .venv name 
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # Runs the poetry installer without interaction from user
    POETRY_NO_INTERACTION=1 \
    \
    # paths
    # this is where our requirements + virtual environment will live
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv" \
    DEBUG=True \
    SECRET_KEY=fkwsueyfgsekfg \
    DJANGO_SUPERUSER_PASSWORD=test \
    DJANGO_SUPERUSER_USERNAME=test \
    DJANGO_SUPERUSER_EMAIL=test@test.com


# Prepend poetry and the virtual environment to the path
ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"


# "builder-base" is used here to compile dependencies and 
# will be used to create the virtual environment
FROM python-base as builder-base
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

RUN mkdir -p /home/backend

# Set the working directory to the root of the backend
WORKDIR /home/backend/

# Copy the pyproject.toml file (our dependencies) to the container
# (Don't copy over the lock file - we wanto to generate that within the container)
COPY pyproject.toml ./

# Install poetry dependencies to the virtual environment created earlier
# Should probably pass in the --no-dev flag at some point during prod build
# i.e. `poetry install --no-interaction --no-cache`
RUN poetry install

# Send the contents of the main backend directory to the container so that
# it follows the same directory structure as the project
COPY base ./base

# Copy the core of the root backend into the container 
# (Look at the .dockerignore file to see what does not get sent over)
COPY . .

# Expose the port to the container
EXPOSE "$PORT"

# Start the Django backend server on port 6969.
# Running this command with "0.0.0.0:PORT" allows us to tell Docker that
# we want this application to be exposed through the Docker DNS bridge.
# It allows our application to be seen *outside* of Docker, and gives us 
# the ability to run it via localhost on our main machine.
CMD ["poetry", "run", "python3", "manage.py", "runserver", "0.0.0.0:6969"]
