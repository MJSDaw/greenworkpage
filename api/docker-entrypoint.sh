#!/bin/bash
set -e

# Asegurar que el directorio de vistas compiladas exista y tenga los permisos correctos
mkdir -p /var/www/html/storage/framework/views
chown -R www-data:www-data /var/www/html/storage/framework/views
chmod -R 775 /var/www/html/storage/framework/views

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
    storage/logs \
    bootstrap/cache

# Crear enlace simbólico para storage
php artisan storage:link

# Asegurar permisos adecuados
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
# Asegurar permisos adecuados
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Iniciar Apache en primer plano
apache2-foreground
