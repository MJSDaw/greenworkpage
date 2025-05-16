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
    
    # Install dependencies with error handling
    if ! npm install --no-fund --no-audit; then
        echo "WARNING: Failed to install frontend dependencies. Continuing without frontend."
    else        # Start the React server in the background
        echo "Starting React development server..."
        npm run dev -- --host 0.0.0.0 &
        
        # Wait for the server to be ready
        sleep 3
        
        # Check if the server is running
        if ! netstat -tulpn | grep :5173 > /dev/null; then
            echo "WARNING: React server may not have started correctly. Check logs."
        else
            echo "React server is running."
        fi
    fi
    cd /var/www/html
fi

# Start Apache in the foreground
apache2-foreground
