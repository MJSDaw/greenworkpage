# Green Work Page

This project consists of a complete application with a Laravel + PostgreSQL backend and a React + Vite frontend to manage a system of eco-friendly workspaces and their reservations. The platform allows users to search, view, and reserve workspaces committed to sustainable practices.

## Overview

Green Work Page is a platform that connects professionals and companies with eco-friendly workspaces. These spaces are characterized by implementing sustainable practices such as:

- Use of renewable energy
- Ergonomic and eco-friendly furniture
- Efficient waste management systems
- Locations accessible by public transportation

## Prerequisites

To run this project you will need:

- Git
- Docker (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Modern browser compatible with ES6

## Installation Guide

### 1. Clone the Repository

First, clone the repository from GitHub:

```bash
git clone https://github.com/MJSDaw/greenworkpage.git
cd greenworkpage
```

### 2. Project Configuration

The project uses Docker for the development environment. Everything is configured in the files located in the root folder.

### 3. Environment Variables Configuration

Copy the example configuration file to create the `.env` file in the `api/` folder:

```bash
cp api/.env.example api/.env
```

Edit the `api/.env` file and configure the following essential variables:

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

### 4. Start Docker Containers

From the project's root folder, run the containers:

```bash
docker-compose up -d
```

This command will start the following services:
- **postgres**: PostgreSQL database
- **laravel**: Laravel application with Apache and support for the React frontend
- **pgadmin**: Graphical interface to manage PostgreSQL

### 4. Verify Container Status

To ensure that the containers are running correctly:

```bash
docker-compose ps
```

You should see the `postgres_container`, `laravel_container`, and `pgadmin_container` containers in "Up" state.

### 5. Automatic Initialization Process

The configuration includes an automatic initialization script (`docker-entrypoint.sh`) that performs:

- Installation of dependencies with Composer (if necessary)
- Waiting for PostgreSQL to be ready
- Execution of database migrations
- Loading initial data (seeders) if `SEED_DB=true`
- Optimization of the application
- Installation of React dependencies (frontend)
- Starting the React development server
- Configuration of appropriate permissions

### 6. Access the Application

Once the containers are running, you can access:

- **Backend API (Laravel)**: `https://localhost:8443`
- **Frontend (React)**: `http://localhost:5173`
- **pgAdmin (Database Management)**: `http://localhost:5050`

Credentials for initial access (if you have run the seeders):

| User type      | Email               | Password   |
|----------------|---------------------|------------|
| Administrator  | admin@greenwork.com | password   |
| User           | user@example.com    | password   |

**Important note**: The backend application is configured to work exclusively with HTTPS. If you try to access via HTTP (http://localhost:8000), you will be automatically redirected to the secure version. Accept the self-signed certificate in your browser when prompted.

## Configuration Parameters

The main configuration parameters are located in the `docker-compose.yml` file:

- PostgreSQL Database:
  - User: `greenworkAdmin`
  - Password: `HIiDV8W7S02bO6AB3ehV`
  - Database: `greenworkdb`
  - Port: `5432`
  - Volume: `postgres_data` (data persistence)

- Laravel Application:
  - HTTP Port: `8000` (redirects to HTTPS)
  - HTTPS Port: `8443` (secure)
  - Volume: `./api:/var/www/html` (source code)
  
- React Frontend:
  - Port: `5173` (development)
  - Build: `npm run build` (production)

## Security

The application implements the following security measures:

- Authentication using Laravel Sanctum (API tokens)
- Forced HTTPS for all communications with the backend
- Input validation in all forms
- CSRF protection in web forms
- Role-based authorization policies
- Sanitization of input and output data

- pgAdmin:
  - Port: `5050`
  - Email: `admin@greenwork.com`
  - Password: `HIiDV8W7S02bO6AB3ehV`

## Troubleshooting

If you encounter any issues with the containers, you can check their logs:

```bash
# View Laravel container logs
docker logs laravel_container

# View PostgreSQL container logs
docker logs postgres_container

# View pgAdmin container logs
docker logs pgadmin_container
```

## Database Management with pgAdmin

The project includes pgAdmin, a graphical interface to manage the PostgreSQL database.

### Accessing pgAdmin

1. Open your web browser and visit: `http://localhost:5050`
2. Log in with the following credentials:
   - Email: `admin@greenwork.com`
   - Password: `HIiDV8W7S02bO6AB3ehV`

### PostgreSQL Connection Configuration

To connect pgAdmin to the database, follow these steps:

1. Right-click on "Servers" in the left panel and select "Register > Server..."
2. In the "General" tab:
   - Name: `GreenWorkDB` (or any descriptive name)

3. In the "Connection" tab:
   - Host name/address: `postgres` (important: use "postgres" as the hostname, not "localhost" or "127.0.0.1")
   - Port: `5432`
   - Maintenance database: `greenworkdb`
   - Username: `greenworkAdmin`
   - Password: `HIiDV8W7S02bO6AB3ehV`
   - Check the "Save password" option if you want to save the password

4. Click "Save" to save the configuration

### Important Note

It is essential to use `postgres` as the hostname in the pgAdmin configuration, as this is the service name defined in `docker-compose.yml`. Within the Docker network, containers communicate with each other using these service names, not "localhost" or IP addresses.

To restart the containers:

1. **Database connection error**:
   - Verify that the PostgreSQL container is running: `docker ps`
   - Check that the credentials in `.env` match those in `docker-compose.yml`
   - Restart the container: `docker-compose restart postgres`

2. **500 Error in the API**:
   - Check Laravel logs: `docker logs laravel_container`
   - Check storage permissions: `docker exec -it laravel_container chmod -R 777 storage`
   - Clear cache: `docker exec -it laravel_container php artisan cache:clear`

3. **Frontend cannot connect to backend**:
   - Verify that the URLs in the frontend correctly point to `https://localhost:8443`
   - Check that CORS is properly configured in `api/config/cors.php`

4. **HTTPS certificate not recognized**:
   - Accept the self-signed certificate in your browser
   - For production environments, replace the certificate with a valid one in the Apache configuration

## Project Structure

The project is organized in the following main folders:

- **api/**: Contains the backend application built with Laravel
  - `app/`: Main application logic
    - `Http/Controllers/`: API controllers
    - `Models/`: Data models
    - `Providers/`: Service providers
  - `routes/`: API route definitions
  - `database/`: Migrations and seeders
  - `config/`: Configuration files
  - `public/`: Application entry point

- **frontend/**: Contains the frontend application built with React and Vite
  - `src/`: React source code
    - `components/`: Reusable components
    - `pages/`: Main pages
    - `services/`: Services for API connection
    - `assets/`: Images and static resources
  - `public/`: Static files

## Development

### Frontend

To work on the frontend independently, you can run:

```bash
cd frontend
npm install
npm run dev
```

This will start the Vite development server at http://localhost:5173 with hot reload for code changes.

### Backend

You can make changes to Laravel code directly in the `api/` folder. The changes will be automatically reflected on the server thanks to the mounted volume.

To run specific Laravel commands, you can use:

```bash
# Run migrations
docker exec -it laravel_container php artisan migrate

# Create a controller
docker exec -it laravel_container php artisan make:controller NewController

# Create a model with migration
docker exec -it laravel_container php artisan make:model NewModel -m
```

### Rebuilding Containers

If you need to rebuild the containers after changing the Docker configuration:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Data Models

The system uses the following main models:

### User
Represents registered users on the platform.
- Attributes: name, email, password, role

### Admin
Extends user functionality for system administrators.
- Functionality: complete management of spaces and reservations

### Space
Represents workspaces available for reservation.
- Attributes: name, description, location, capacity, price, eco-friendly features

### Reservation
Manages space reservations by users.
- Attributes: user, space, start date, end date, status

### Contact
Stores contact messages sent through the form.
- Attributes: name, email, subject, message

## API Endpoints

The RESTful API provides the following main endpoints:

| Method | Route | Description | Authentication |
|--------|------|-------------|---------------|
| GET | /api/spaces | List all spaces | No |
| GET | /api/spaces/{id} | Get space details | No |
| POST | /api/spaces | Create new space | Admin |
| PUT | /api/spaces/{id} | Update space | Admin |
| DELETE | /api/spaces/{id} | Delete space | Admin |
| GET | /api/reservations | List user's reservations | User |
| POST | /api/reservations | Create new reservation | User |
| GET | /api/admin/reservations | List all reservations | Admin |
| POST | /api/contact | Send contact message | No |
| POST | /api/login | Login | No |
| POST | /api/register | Register user | No |

For more details about available endpoints, check the documentation at `/api/documentation` (when available).

## Contributions

If you want to contribute to the project:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add a new feature'`)
4. Push the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## Contact

If you find any critical errors or have suggestions to improve the project, please notify via email: mjsdaw@gmail.com