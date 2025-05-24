#!/bin/bash
set -e

# Ensure the compiled views directory exists and has the correct permissions
mkdir -p /var/www/html/storage/framework/views
chown -R www-data:www-data /var/www/html/storage/framework/views
chmod -R 775 /var/www/html/storage/framework/views

# Run composer install if vendor directory is empty
if [ ! "$(ls -A /var/www/html/vendor)" ]; then
    echo "Vendor directory is empty, running composer install..."
    composer install --no-interaction --optimize-autoloader
else
    echo "Vendor directory already populated, skipping composer install."
fi

# Wait until PostgreSQL is ready
until pg_isready -h postgres -p 5432 -U greenworkAdmin; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
done

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Run seeders if necessary
if [ "$SEED_DB" = "true" ]; then
    echo "Seeding database..."
    php artisan db:seed --force
fi

# Clear and optimize the application
php artisan optimize:clear
php artisan optimize

# Ensure necessary directories exist
mkdir -p storage/app/public \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/framework/testing \
    storage/logs \
    bootstrap/cache

# Create symbolic link for storage
php artisan storage:link

# Ensure proper permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Install frontend dependencies and start the React server
if [ -d "/var/www/frontend" ]; then
    echo "Installing frontend dependencies..."
    cd /var/www/frontend
    
    # Check if node_modules exists before installing
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo "Installing frontend dependencies..."
        if ! npm install --no-fund --no-audit; then
            echo "WARNING: Failed to install frontend dependencies. Continuing without frontend."
        else
            echo "Frontend dependencies installed successfully."
            # Touch a file to indicate that install was completed
            touch node_modules/.package-lock.json
        fi
    else
        echo "Frontend dependencies are already installed."
    fi
      # Start the React server in the background with hot reload enabled
    echo "Starting React development server with hot reload..."
    WATCHPACK_POLLING=true npm run dev -- --host 0.0.0.0 &
    
    # Wait for the server to be ready
    sleep 3
    
    # Check if the server is running (using ps since netstat might not be available)
    if ! ps aux | grep -v grep | grep "npm run dev" > /dev/null; then
        echo "WARNING: React server may not have started correctly. Check logs."
    else
        echo "React server is running with hot reload enabled."
    fi
    
    cd /var/www/html
fi

# Start Apache in the foreground
apache2-foreground
