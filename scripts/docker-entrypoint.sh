#!/bin/bash
set -e

# Asegurar que el directorio de vistas compiladas exista y tenga los permisos correctos
mkdir -p /var/www/html/storage/framework/views
chown -R www-data:www-data /var/www/html/storage/framework/views
chmod -R 775 /var/www/html/storage/framework/views

# Verify SSL certificates and setup if needed
if [ ! -f /etc/ssl/certs/ssl-cert-snakeoil.pem ] || [ ! -f /etc/ssl/private/ssl-cert-snakeoil.key ]; then
    echo "SSL certificate not found, generating self-signed certificate..."
    make-ssl-cert generate-default-snakeoil --force-overwrite
fi

# Ejecutar composer install si vendor está vacío
if [ ! "$(ls -A /var/www/html/vendor)" ]; then
    echo "Vendor directory is empty, running composer install..."
    composer install --no-interaction --optimize-autoloader
else
    echo "Vendor directory already populated, skipping composer install."
fi

# Esperar a que PostgreSQL esté listo
until pg_isready -h postgres -p 5432 -U greenworkAdmin; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
done

# Ejecutar migraciones
echo "Running database migrations..."
php artisan migrate --force

# Ejecutar seeders si es necesario
if [ "$SEED_DB" = "true" ]; then
    echo "Seeding database..."
    php artisan db:seed --force
fi

# Limpiar y optimizar la aplicación
php artisan optimize:clear
php artisan optimize

# Asegurar que existen los directorios necesarios
mkdir -p storage/app/public \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/framework/testing \
    storage/app/backups \
    storage/logs \
    bootstrap/cache

# Crear enlace simbólico para storage
php artisan storage:link

# Set HTTPS in .env if needed
if [ "$FORCE_HTTPS" = "true" ] && grep -q "APP_URL=http:" /var/www/html/.env; then
    echo "Updating APP_URL to use HTTPS..."
    sed -i 's/APP_URL=http:/APP_URL=https:/g' /var/www/html/.env
fi

# Asegurar permisos adecuados
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Instalar dependencias del frontend y levantar el servidor de React
if [ -d "/var/www/frontend" ]; then
    echo "Installing frontend dependencies..."
    cd /var/www/frontend
    
    # Instalar dependencias con manejo de errores
    if ! npm install --no-fund --no-audit; then
        echo "WARNING: Failed to install frontend dependencies. Continuing without frontend."
    else
        # Iniciar el servidor de React en segundo plano
        echo "Starting React development server..."
        npm run dev -- --host 0.0.0.0 &
        
        # Esperar a que el servidor esté listo
        sleep 3
        
        # Verificar si el servidor está ejecutándose
        if ! netstat -tulpn | grep :5173 > /dev/null; then
            echo "WARNING: React server may not have started correctly. Check logs."
        else
            echo "React server is running."
        fi
    fi
    cd /var/www/html
fi

# Iniciar Apache en primer plano
apache2-foreground
