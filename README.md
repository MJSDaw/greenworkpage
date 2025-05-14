# Green Work Page

Este proyecto consta de una aplicación completa con un backend en Laravel + PostgreSQL y un frontend en React + Vite para gestionar un sistema de espacios de trabajo ecológicos y sus reservas. La plataforma permite a los usuarios buscar, visualizar y reservar espacios de trabajo comprometidos con prácticas sostenibles.

## Descripción General

Green Work Page es una plataforma que conecta a profesionales y empresas con espacios de trabajo ecológicos. Estos espacios se caracterizan por implementar prácticas sostenibles como:

- Uso de energías renovables
- Mobiliario ergonómico y ecológico
- Sistemas de gestión de residuos eficientes
- Ubicaciones accesibles mediante transporte público

## Requisitos Previos

Para ejecutar este proyecto necesitarás:

- Git
- Docker (versión 20.10.0 o superior)
- Docker Compose (versión 2.0.0 o superior)
- Navegador moderno compatible con ES6

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

Copia el archivo de configuración de ejemplo para crear el archivo `.env` en la carpeta `api/`:

```bash
cp api/.env.example api/.env
```

Edita el archivo `api/.env` y configura las siguientes variables esenciales:

```
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=greenworkdb
DB_USERNAME=greenworkAdmin
DB_PASSWORD=tucontraseñasegura

APP_URL=https://localhost:8443
FRONTEND_URL=http://localhost:5173
```

### 4. Iniciar los Contenedores Docker

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

Credenciales para acceso inicial (si has ejecutado los seeders):

| Tipo de usuario | Email               | Contraseña |
|----------------|---------------------|------------|
| Administrador  | admin@greenwork.com | password   |
| Usuario        | user@example.com    | password   |

**Nota importante**: La aplicación backend está configurada para trabajar exclusivamente con HTTPS. Si intentas acceder mediante HTTP (http://localhost:8000), serás redirigido automáticamente a la versión segura. Acepte el certificado autofirmado en su navegador cuando se le solicite.

## Parámetros de Configuración

Los parámetros de configuración principales se encuentran en el archivo `docker-compose.yml`:

- Base de datos PostgreSQL:
  - Usuario: `greenworkAdmin`
  - Base de datos: `greenworkdb`
  - Puerto: `5432`
  - Volumen: `postgres_data` (persistencia de datos)

- Aplicación Laravel:
  - Puerto HTTP: `8000` (redirige a HTTPS)
  - Puerto HTTPS: `8443` (seguro)
  - Volumen: `./api:/var/www/html` (código fuente)
  
- Frontend React:
  - Puerto: `5173` (desarrollo)
  - Construcción: `npm run build` (producción)

## Seguridad

La aplicación implementa las siguientes medidas de seguridad:

- Autenticación mediante Laravel Sanctum (API tokens)
- HTTPS forzado para todas las comunicaciones con el backend
- Validación de entradas en todos los formularios
- Protección CSRF en formularios web
- Políticas de autorización basadas en roles
- Sanitización de datos de entrada y salida

## Resolución de Problemas

Si encuentras algún problema con los contenedores, puedes verificar sus logs:

```bash
# Ver logs del contenedor de Laravel
docker logs laravel_container

# Ver logs del contenedor de PostgreSQL
docker logs postgres_container
```

### Problemas comunes y soluciones:

1. **Error de conexión a la base de datos**:
   - Verifica que el contenedor de PostgreSQL esté funcionando: `docker ps`
   - Comprueba que las credenciales en el `.env` coinciden con las del `docker-compose.yml`
   - Reinicia el contenedor: `docker-compose restart postgres`

2. **Error 500 en la API**:
   - Verifica los logs de Laravel: `docker logs laravel_container`
   - Comprueba los permisos de almacenamiento: `docker exec -it laravel_container chmod -R 777 storage`
   - Limpia la caché: `docker exec -it laravel_container php artisan cache:clear`

3. **Frontend no puede conectar con el backend**:
   - Verifica que las URLs en el frontend apuntan correctamente a `https://localhost:8443`
   - Comprueba que CORS está configurado correctamente en `api/config/cors.php`

4. **Certificado HTTPS no reconocido**:
   - Acepta el certificado autofirmado en tu navegador
   - Para entornos de producción, reemplaza el certificado por uno válido en la configuración Apache

## Estructura del Proyecto

El proyecto está organizado en las siguientes carpetas principales:

- **api/**: Contiene la aplicación backend construida con Laravel
  - `app/`: Lógica principal de la aplicación
    - `Http/Controllers/`: Controladores de la API
    - `Models/`: Modelos de datos
    - `Providers/`: Proveedores de servicios
  - `routes/`: Definición de rutas de la API
  - `database/`: Migraciones y seeders
  - `config/`: Archivos de configuración
  - `public/`: Punto de entrada de la aplicación

- **frontend/**: Contiene la aplicación frontend construida con React y Vite
  - `src/`: Código fuente de React
    - `components/`: Componentes reutilizables
    - `pages/`: Páginas principales
    - `services/`: Servicios para conexión con API
    - `assets/`: Imágenes y recursos estáticos
  - `public/`: Archivos estáticos

## Desarrollo

### Frontend

Para trabajar en el frontend de forma independiente, puedes ejecutar:

```bash
cd frontend
npm install
npm run dev
```

Esto iniciará el servidor de desarrollo de Vite en http://localhost:5173 con recarga en caliente para cambios en el código.

### Backend

Puedes realizar cambios en el código de Laravel directamente en la carpeta `api/`. Los cambios se reflejarán automáticamente en el servidor gracias al volumen montado.

Para ejecutar comandos específicos de Laravel, puedes usar:

```bash
# Ejecutar migraciones
docker exec -it laravel_container php artisan migrate

# Crear un controlador
docker exec -it laravel_container php artisan make:controller NuevoController

# Crear un modelo con migración
docker exec -it laravel_container php artisan make:model NuevoModelo -m
```

### Reconstrucción de Contenedores

Si necesitas reconstruir los contenedores después de cambiar la configuración de Docker:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Modelos de Datos

El sistema utiliza los siguientes modelos principales:

### User
Representa a los usuarios registrados en la plataforma.
- Atributos: nombre, email, contraseña, rol

### Admin
Extiende la funcionalidad de usuarios para administradores del sistema.
- Funcionalidad: gestión completa de espacios y reservas

### Space
Representa los espacios de trabajo disponibles para reserva.
- Atributos: nombre, descripción, ubicación, capacidad, precio, características ecológicas

### Reservation
Gestiona las reservas de espacios por parte de los usuarios.
- Atributos: usuario, espacio, fecha inicio, fecha fin, estado

### Contact
Almacena los mensajes de contacto enviados a través del formulario.
- Atributos: nombre, email, asunto, mensaje

## API Endpoints

La API RESTful proporciona los siguientes endpoints principales:

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | /api/spaces | Listar todos los espacios | No |
| GET | /api/spaces/{id} | Obtener detalles de un espacio | No |
| POST | /api/spaces | Crear nuevo espacio | Admin |
| PUT | /api/spaces/{id} | Actualizar espacio | Admin |
| DELETE | /api/spaces/{id} | Eliminar espacio | Admin |
| GET | /api/reservations | Listar reservas del usuario | Usuario |
| POST | /api/reservations | Crear nueva reserva | Usuario |
| GET | /api/admin/reservations | Listar todas las reservas | Admin |
| POST | /api/contact | Enviar mensaje de contacto | No |
| POST | /api/login | Iniciar sesión | No |
| POST | /api/register | Registrar usuario | No |

Para más detalles sobre los endpoints disponibles, consulta la documentación en `/api/documentation` (cuando esté disponible).

## Contribuciones

Si deseas contribuir al proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -am 'Añade una nueva característica'`)
4. Sube la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Contacto

Si encuentras algún error crítico o tienes sugerencias para mejorar el proyecto, por favor notifícalo al correo: mjsdaw@gmail.com