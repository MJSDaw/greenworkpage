# Green Work Page

Este proyecto consta de una aplicación Laravel con PostgreSQL para gestionar un sistema de espacios y reservas.

## Requisitos Previos

Para ejecutar este proyecto necesitarás:

- Git
- Docker
- Docker Compose

## Guía de Instalación

### 1. Clonar el Repositorio

Primero, clona el repositorio desde GitHub:

```bash
git clone https://github.com/MJSDaw/greenworkpage.git
cd greenworkpage
```

### 2. Configuración del Proyecto

El proyecto utiliza Docker para el entorno de desarrollo. Todo está configurado en los archivos que se encuentran en la carpeta `api/`.

### 3. Configuración de Variables de Entorno

Copia el archivo de configuración de ejemplo para crear el archivo `.env` y rellena las variables necesarias con la información obtenida por los administradores de la aplicación.

### 3. Iniciar los Contenedores Docker

Navega a la carpeta `api` y ejecuta los contenedores:

```bash
cd api
docker-compose up -d
```

Este comando iniciará los siguientes servicios:
- **postgres**: Base de datos PostgreSQL
- **laravel**: Aplicación Laravel con Apache

### 4. Verificar el Estado de los Contenedores

Para asegurarte de que los contenedores están funcionando correctamente:

```bash
docker-compose ps
```

Deberías ver los contenedores `postgres_container` y `laravel_container` en estado "Up".

### 5. Proceso de Inicialización Automática

La configuración incluye un script de inicialización automática (`docker-entrypoint.sh`) que realiza:

- Instalación de dependencias con Composer (si es necesario)
- Espera a que PostgreSQL esté listo
- Ejecución de migraciones de base de datos
- Carga de datos iniciales (seeders) si `SEED_DB=true`
- Optimización de la aplicación
- Configuración de permisos adecuados

### 6. Acceder a la Aplicación

Una vez que los contenedores estén funcionando, puedes acceder a la aplicación en:

```
https://localhost:8443
```

**Nota importante**: La aplicación está configurada para trabajar exclusivamente con HTTPS. Si intentas acceder mediante HTTP (http://localhost:8000), serás redirigido automáticamente a la versión segura.

## Parámetros de Configuración

Los parámetros de configuración principales se encuentran en el archivo `docker-compose.yml`:

- Base de datos PostgreSQL:
  - Usuario: `greenworkAdmin`
  - Base de datos: `greenworkdb`
  - Puerto: `5432`

- Aplicación Laravel:
  - Puerto: `8000`

## Resolución de Problemas

Si encuentras algún problema con los contenedores, puedes verificar sus logs:

```bash
# Ver logs del contenedor de Laravel
docker logs laravel_container

# Ver logs del contenedor de PostgreSQL
docker logs postgres_container
```

Para reiniciar los contenedores:

```bash
docker-compose down
docker-compose up -d
```

Si encuentras algún error crítico o tienes sugerencias para mejorar el proyecto, por favor notifícalo al correo: mjsdaw@gmail.com

## Estructura del Proyecto

El proyecto sigue la estructura estándar de Laravel con:

- `app/Models`: Modelos de datos (User, Space, Reservation)
- `database/migrations`: Migraciones para crear tablas
- `database/seeders`: Datos iniciales
- `routes`: Configuración de rutas API y web