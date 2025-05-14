# Green Work Page

Este proyecto consta de una aplicación completa con un backend en Laravel + PostgreSQL y un frontend en React + Vite para gestionar un sistema de espacios de trabajo ecológicos y sus reservas.

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

El proyecto utiliza Docker para el entorno de desarrollo. Todo está configurado en los archivos que se encuentran en la carpeta raíz.

### 3. Configuración de Variables de Entorno

Copia el archivo de configuración de ejemplo para crear el archivo `.env` en la carpeta `api/` y rellena las variables necesarias con la información obtenida por los administradores de la aplicación.

### 3. Iniciar los Contenedores Docker

Desde la carpeta raíz del proyecto, ejecuta los contenedores:

```bash
docker-compose up -d
```

Este comando iniciará los siguientes servicios:
- **postgres**: Base de datos PostgreSQL
- **laravel**: Aplicación Laravel con Apache y soporte para el frontend React

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
- Instalación de dependencias de React (frontend)
- Inicio del servidor de desarrollo de React
- Configuración de permisos adecuados

### 6. Acceder a la Aplicación

Una vez que los contenedores estén funcionando, puedes acceder a:

- **Backend API (Laravel)**: `https://localhost:8443`
- **Frontend (React)**: `http://localhost:5173`

**Nota importante**: La aplicación backend está configurada para trabajar exclusivamente con HTTPS. Si intentas acceder mediante HTTP (http://localhost:8000), serás redirigido automáticamente a la versión segura.

## Parámetros de Configuración

Los parámetros de configuración principales se encuentran en el archivo `docker-compose.yml`:

- Base de datos PostgreSQL:
  - Usuario: `greenworkAdmin`
  - Base de datos: `greenworkdb`
  - Puerto: `5432`

- Aplicación Laravel:
  - Puerto HTTP: `8000`
  - Puerto HTTPS: `8443`
  
- Frontend React:
  - Puerto: `5173`

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
docker-compose restart
```

## Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas principales:

- **api/**: Contiene la aplicación backend construida con Laravel
  - `app/`: Lógica principal de la aplicación
  - `routes/`: Definición de rutas de la API
  - `database/`: Migraciones y seeders
  - `public/`: Punto de entrada de la aplicación

- **frontend/**: Contiene la aplicación frontend construida con React y Vite
  - `src/`: Código fuente de React
  - `public/`: Archivos estáticos

## Desarrollo

### Frontend

Para trabajar en el frontend de forma independiente, puedes ejecutar:

```bash
cd frontend
npm run dev
```

### Backend

Puedes realizar cambios en el código de Laravel directamente en la carpeta `api/`. Los cambios se reflejarán automáticamente en el servidor gracias al volumen montado.

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