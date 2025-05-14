# Usa una imagen oficial de PHP con soporte para Apache
FROM php:8.2-apache

# Instala las extensiones necesarias para Laravel, PostgreSQL, Node.js y npm
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    ssl-cert \
    nodejs \
    npm \
    && docker-php-ext-install pdo pdo_pgsql

# Habilitar el módulo SSL en Apache
RUN a2enmod ssl

# Instala Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Configura el directorio de trabajo en el contenedor
WORKDIR /var/www/html

# Copia el archivo de configuración de Apache para Laravel
RUN a2enmod rewrite

# Crea los directorios necesarios para Laravel
RUN mkdir -p storage/app/public \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/framework/testing \
    storage/logs \
    bootstrap/cache

# Ajusta los permisos de las carpetas necesarias
RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

# Copia la configuración de Apache
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Instalar postgres client para pg_isready
RUN apt-get install -y postgresql-client

# Copia el script de entrada
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Establece el script de entrada como el comando predeterminado
ENTRYPOINT ["docker-entrypoint.sh"]
