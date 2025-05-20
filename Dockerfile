# Use an official PHP image with Apache support
FROM php:8.2-apache

# Install necessary extensions for Laravel, PostgreSQL, Node.js and npm
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    ssl-cert \
    nodejs \
    npm \
    dos2unix \
    net-tools \
    procps \
    postgresql-client \
    && docker-php-ext-install pdo pdo_pgsql

# Enable SSL module in Apache
RUN a2enmod ssl

# Install Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Configure the working directory in the container
WORKDIR /var/www/html

# Copy Apache configuration file for Laravel
RUN a2enmod rewrite

# Create necessary directories for Laravel
RUN mkdir -p storage/app/public \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/framework/testing \
    storage/logs \
    bootstrap/cache

# Adjust permissions for necessary folders
RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

# Copy Apache configuration
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Copy the entry script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN dos2unix /usr/local/bin/docker-entrypoint.sh
# Verify that the file exists
RUN ls -la /usr/local/bin/docker-entrypoint.sh

# Set the entry script as the default command
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
