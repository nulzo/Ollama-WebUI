#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Django backend setup...${NC}"

# Function to wait for database
wait_for_db() {
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    
    # Extract database info from DATABASE_URL or use defaults
    DB_HOST=${DATABASE_URL#*@}
    DB_HOST=${DB_HOST%/*}
    DB_HOST=${DB_HOST%:*}
    
    if [ -z "$DB_HOST" ]; then
        DB_HOST="db"
    fi
    
    # Wait for database connection
    while ! python << EOF
import psycopg2
import os
import sys
from urllib.parse import urlparse

try:
    # Parse DATABASE_URL or use environment variables
    database_url = os.getenv('DATABASE_URL', '')
    if database_url:
        parsed = urlparse(database_url)
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path[1:]  # Remove leading slash
        )
    else:
        # Fallback to individual env vars
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'db'),
            port=int(os.getenv('POSTGRES_PORT', '5432')),
            user=os.getenv('POSTGRES_USER', 'ollama_user'),
            password=os.getenv('POSTGRES_PASSWORD', 'change_me_in_production'),
            database=os.getenv('POSTGRES_DB', 'ollama_webui')
        )
    conn.close()
    print("Database connection successful")
except Exception as e:
    print(f"Database connection failed: {e}")
    sys.exit(1)
EOF
    do
        echo -e "${YELLOW}Database not ready, waiting 2 seconds...${NC}"
        sleep 2
    done
    
    echo -e "${GREEN}Database is ready!${NC}"
}

# Function to run migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    python manage.py makemigrations --noinput
    python manage.py migrate --noinput
    echo -e "${GREEN}Migrations completed!${NC}"
}

# Function to create superuser
create_superuser() {
    echo -e "${YELLOW}Creating superuser...${NC}"
    python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()

username = '$DJANGO_SUPERUSER_USERNAME'
email = '$DJANGO_SUPERUSER_EMAIL'
password = '$DJANGO_SUPERUSER_PASSWORD'

if username and email and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Superuser '{username}' created successfully")
    else:
        print(f"Superuser '{username}' already exists")
else:
    print("Superuser credentials not provided, skipping creation")
EOF
    echo -e "${GREEN}Superuser setup completed!${NC}"
}

# Function to load fixtures
load_fixtures() {
    echo -e "${YELLOW}Loading fixtures...${NC}"
    if [ -f "api/fixtures/default_conversations.json" ]; then
        python manage.py loaddata api/fixtures/default_conversations.json || echo "Failed to load default conversations fixture"
    fi
    echo -e "${GREEN}Fixtures loaded!${NC}"
}

# Function to collect static files (for production)
collect_static() {
    if [ "$DEBUG" = "False" ] || [ "$DEBUG" = "false" ]; then
        echo -e "${YELLOW}Collecting static files...${NC}"
        python manage.py collectstatic --noinput
        echo -e "${GREEN}Static files collected!${NC}"
    fi
}

# Main setup process
main() {
    # Wait for database
    # wait_for_db
    
    # Run migrations
    run_migrations
    
    # Create superuser
    create_superuser
    
    # Load fixtures
    load_fixtures
    
    # Collect static files
    collect_static
    
    echo -e "${GREEN}Django backend setup completed successfully!${NC}"
    
    # Execute the main command
    echo -e "${YELLOW}Starting Django server...${NC}"
    exec "$@"
}

# Run main function with all arguments passed to script
main "$@" 