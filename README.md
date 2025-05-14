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
- **pgadmin**: Interfaz gráfica para gestionar PostgreSQL

### 4. Verificar el Estado de los Contenedores

Para asegurarte de que los contenedores están funcionando correctamente:

```bash
docker-compose ps
```

Deberías ver los contenedores `postgres_container`, `laravel_container` y `pgadmin_container` en estado "Up".

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
- **pgAdmin (Gestión de Base de Datos)**: `http://localhost:5050`

**Nota importante**: La aplicación backend está configurada para trabajar exclusivamente con HTTPS. Si intentas acceder mediante HTTP (http://localhost:8000), serás redirigido automáticamente a la versión segura.

## Parámetros de Configuración

Los parámetros de configuración principales se encuentran en el archivo `docker-compose.yml`:

- Base de datos PostgreSQL:
  - Usuario: `greenworkAdmin`
  - Contraseña: `HIiDV8W7S02bO6AB3ehV`
  - Base de datos: `greenworkdb`
  - Puerto: `5432`

- Aplicación Laravel:
  - Puerto HTTP: `8000`
  - Puerto HTTPS: `8443`
  
- Frontend React:
  - Puerto: `5173`

- pgAdmin:
  - Puerto: `5050`
  - Email: `admin@greenwork.com`
  - Contraseña: `HIiDV8W7S02bO6AB3ehV`

## Resolución de Problemas

Si encuentras algún problema con los contenedores, puedes verificar sus logs:

```bash
# Ver logs del contenedor de Laravel
docker logs laravel_container

# Ver logs del contenedor de PostgreSQL
docker logs postgres_container

# Ver logs del contenedor de pgAdmin
docker logs pgadmin_container
```

## Gestión de la Base de Datos con pgAdmin

El proyecto incluye pgAdmin, una interfaz gráfica para administrar la base de datos PostgreSQL.

### Acceso a pgAdmin

1. Abre tu navegador web y visita: `http://localhost:5050`
2. Inicia sesión con las siguientes credenciales:
   - Email: `admin@greenwork.com`
   - Contraseña: `HIiDV8W7S02bO6AB3ehV`

### Configuración de la Conexión a PostgreSQL

Para conectar pgAdmin a la base de datos, sigue estos pasos:

1. Haz clic derecho en "Servers" en el panel izquierdo y selecciona "Register > Server..."
2. En la pestaña "General":
   - Name: `GreenWorkDB` (o cualquier nombre descriptivo)

3. En la pestaña "Connection":
   - Host name/address: `postgres` (importante: usa "postgres" como nombre de host, no "localhost" ni "127.0.0.1")
   - Port: `5432`
   - Maintenance database: `greenworkdb`
   - Username: `greenworkAdmin`
   - Password: `HIiDV8W7S02bO6AB3ehV`
   - Marca la opción "Save password" si deseas guardar la contraseña

4. Haz clic en "Save" para guardar la configuración

### Nota Importante

Es fundamental usar `postgres` como nombre del host en la configuración de pgAdmin, ya que este es el nombre del servicio definido en el `docker-compose.yml`. Dentro de la red de Docker, los contenedores se comunican entre sí usando estos nombres de servicio, no mediante "localhost" ni direcciones IP.

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