FROM oven/bun:latest

ARG VITE_APP_BACKEND_API_URL
ARG VITE_APP_APP_URL
ARG VITE_APP_BACKEND_API_VERSION

ENV VITE_APP_BACKEND_API_URL=${VITE_APP_BACKEND_API_URL} \
    VITE_APP_APP_URL=${VITE_APP_APP_URL} \
    VITE_APP_BACKEND_API_VERSION=${VITE_APP_BACKEND_API_VERSION}

RUN mkdir -p /home/frontend

# Set the working directory to where the frontend will live
WORKDIR /home/frontend

# Send over the NPM dependencies from our project
# We should not send over the lock file since NPM can fail if
# using the cache from another machine. See the link below to see why
# https://stackoverflow.com/a/67431349
COPY package.json ./

# Run npm install (this is a fresh install and will be specific to container)
# Again, it has no lock file to build from, so it might take a minute.
RUN bun install

# Send over the root information into the frontend directory
COPY . .

# Run npm run build to:
# 1. Compile typescript code (Build will fail if errors are present)
# 2. Compile into ./dist file (will contain the "production" code)
# RUN npm run build

RUN bunx tailwindcss --watch -i ./src/style/globals.css -o ./src/style/output.css &

# Run a command to preview the production build in ./dist.
# This preview will be the last thing that is run before the container terminates
# Check the documentation if you want to learn more about CMD vs RUN
# CMD ["npm", "run", "dev"]
