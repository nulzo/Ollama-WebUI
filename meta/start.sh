#!/bin/sh

# Start Docker Daemon
dockerd &

# Wait for Docker Daemon to start
while(! docker stats --no-stream ); do
  echo "Waiting for Docker to launch..."
  sleep 1
done

# Pull the service images
docker pull nolanserviceaccount/backend:latest
docker pull nolanserviceaccount/frontend:latest
docker pull nolanserviceaccount/proxy:latest

if [ -z "$OLLAMA_PORT" ]; then
  echo "OLLAMA_PORT is not set. Exiting."
  exit 1
fi

if [ -z "$OLLAMA_HOST" ]; then
  echo "OLLAMA_HOST is not set. Exiting."
  exit 1
fi

# Run the backend container
docker run -d --name backend \
  -e API_KEY="$API_KEY" \
  --restart always \
  nolanserviceaccount/backend:latest

# Run the frontend container
docker run -d --name frontend \
  --link backend:backend \
  -p 4200:4200 \
  -e OLLAMA_PORT="$OLLAMA_PORT" \
  -e OLLAMA_HOST="$OLLAMA_HOST" \
  --restart always \
  nolanserviceaccount/frontend:latest

# Run the Nginx container
docker run -d --name nginx \
  --link frontend:frontend \
  -p 80:5073 \
  --restart always \
  nolanserviceaccount/proxy:latest

# Keep the script running
tail -f /dev/null
