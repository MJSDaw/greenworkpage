#!/bin/bash
set -e

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

# Asegurar permisos adecuados
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Iniciar Apache en primer plano
apache2-foreground
