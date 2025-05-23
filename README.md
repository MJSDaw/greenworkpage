# Green Work Page

Green Work Page es una plataforma completa para la gestión de espacios de trabajo eco-friendly y sus reservas, compuesta por un backend Laravel + PostgreSQL y un frontend React + Vite. Permite a los usuarios buscar, visualizar y reservar espacios comprometidos con la sostenibilidad.

## Arquitectura

- **Backend:** Laravel (API RESTful) + PostgreSQL. Gestiona usuarios, espacios, reservas, auditorías, autenticación y lógica de negocio.
- **Frontend:** React + Vite. Interfaz moderna, responsive y multilingüe, que consume la API y permite la interacción con todas las funcionalidades.
- **Contenedores:** Docker y Docker Compose para facilitar el desarrollo y despliegue.

## Estructura de carpetas

- `/api`: Backend Laravel
  - `/app/Models/`: Modelos de datos (User, Space, Booking, etc.)
  - `/app/Http/Controllers/`: Controladores de la API
  - `/database/migrations/`: Migraciones de la base de datos
  - `/database/seeders/`: Carga de datos iniciales
  - `/routes/api.php`: Definición de rutas de la API
  - `/config/`: Archivos de configuración
  - `/public/`: Punto de entrada y recursos públicos
  - `/storage/`: Archivos subidos y logs
- `/frontend`: Frontend React
  - `/src/components/`: Componentes reutilizables
  - `/src/pages/`: Páginas principales
  - `/src/services/`: Servicios para conexión con la API
  - `/src/assets/`: Imágenes y recursos estáticos
  - `/src/locales/`: Archivos de internacionalización (traducciones)
  - `/public/`: Archivos estáticos públicos
  - `/index.html`: Archivo base del frontend

Esta organización separa claramente la lógica de negocio, la gestión de datos y la presentación, facilitando el mantenimiento y la escalabilidad.

## Características principales

- **Internacionalización:** El frontend soporta múltiples idiomas usando i18next. Los metadatos de la página (título, descripción, etc.) se actualizan dinámicamente según el idioma seleccionado.
- **Seguridad:**
  - Autenticación con Laravel Sanctum (API tokens)
  - HTTPS forzado en backend
  - Validación y sanitización de entradas
  - Políticas de autorización por roles
  - Protección CSRF
- **Frontend moderno:**
  - React 19, Vite, ESLint, Prettier
  - Componentes reutilizables y diseño responsive
  - Integración con la API mediante servicios
- **Desarrollo con Docker:**
  - Contenedores para backend, base de datos y frontend
  - Scripts de inicialización automática
  - Certificados autofirmados para desarrollo seguro

## Instalación rápida

1. **Clona el repositorio:**

```bash
git clone https://github.com/MJSDaw/greenworkpage.git
cd greenworkpage
```

2. **Configura variables de entorno:**

```bash
cp api/.env.example api/.env
# Edita api/.env y ajusta las variables necesarias (DB, APP_URL, FRONTEND_URL)
```

3. **Inicia los contenedores:**

```bash
docker-compose up -d
```

4. **Accede a la aplicación:**
- Backend API (Laravel): `https://localhost:8443`
- Frontend (React): `http://localhost:5173`
- pgAdmin: `http://localhost:5050`

**Credenciales iniciales:**

| Tipo de usuario | Email               | Contraseña |
|-----------------|---------------------|------------|
| Administrador   | admin@greenwork.com | password   |
| Usuario         | user@example.com    | password   |

> **Nota:** El backend solo acepta conexiones HTTPS. Acepta el certificado autofirmado en tu navegador para desarrollo.

## Desarrollo frontend independiente

```bash
cd frontend
npm install
npm run dev
```

Esto inicia el servidor Vite en http://localhost:5173 con recarga en caliente.

## Internacionalización

- Los archivos de traducción están en `/frontend/src/locales/`.
- El idioma se detecta automáticamente y puede cambiarse en la interfaz.
- Los metadatos de la página se actualizan dinámicamente según el idioma.

## Gestión de certificados HTTPS (desarrollo)

- Los certificados autofirmados se encuentran en `/frontend/certs/` y se usan para el desarrollo local seguro.
- Si tienes problemas de advertencia de seguridad, acepta el certificado en tu navegador.

## Estructura de la API y modelos

Consulta la sección "API Endpoints" y "Data Models" más abajo para detalles sobre rutas y modelos principales.

## Contribuciones

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-feature`)
3. Haz tus cambios y commitea (`git commit -am 'Agrega nueva feature'`)
4. Sube la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## Contacto

Para reportar errores críticos o sugerencias: mjsdaw@gmail.com

---

El resto del README (parámetros de configuración, troubleshooting, detalles de modelos y endpoints) se mantiene actualizado y útil para referencia técnica y despliegue.