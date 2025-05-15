# HTTPS Configuration for Green Work Page

Este documento describe cómo se ha configurado HTTPS en todos los contenedores y servicios de la aplicación Green Work Page.

## Componentes con HTTPS activado

Todos los servicios de la aplicación están configurados para funcionar con HTTPS:

1. **Laravel API (Backend)**
   - Redirige automáticamente todas las peticiones HTTP a HTTPS
   - Fuerza HTTPS en todas las URLs generadas por Laravel

2. **React Frontend**
   - Servidor de desarrollo de Vite configurado con HTTPS
   - API proxy configurado para comunicarse con la API a través de HTTPS

3. **PostgreSQL**
   - Conexiones seguras a través de SSL

4. **pgAdmin**
   - Interfaz web accesible solo a través de HTTPS
   - Certificados SSL configurados

## Certificados SSL

El proyecto utiliza certificados SSL para asegurar las conexiones:

1. Los certificados son autofirmados para desarrollo local
2. Se almacenan en el volumen `ssl_certs` que comparten todos los contenedores
3. Para generar nuevos certificados, ejecuta el script:

```bash
chmod +x generate-ssl.sh
./generate-ssl.sh
```

## Puertos HTTPS

Los servicios están disponibles en los siguientes puertos HTTPS:

- Frontend React: https://localhost:5173
- API Laravel: https://localhost:8443
- pgAdmin: https://localhost:5050

## Cambio de configuración HTTP a HTTPS

Si necesitas realizar cambios en la configuración HTTPS, puedes modificar los siguientes archivos:

1. **Docker Compose**: `docker-compose.yml` para cambiar los puertos o variables de entorno
2. **Apache**: `config/000-default.conf` para configuración de Apache y SSL
3. **Vite**: `frontend/vite.config.js` para configuración del servidor de desarrollo
4. **pgAdmin**: `config/pgadmin.json` para configuración de HTTPS en pgAdmin

## Debugging de HTTPS

Si tienes problemas con HTTPS:

1. Verifica que los certificados estén correctamente generados en la carpeta `ssl/`
2. Asegúrate de aceptar los certificados autofirmados en tu navegador
3. Comprueba los logs de los contenedores para errores relacionados con SSL:

```bash
docker logs laravel_container
docker logs postgres_container
docker logs pgadmin_container
```

## Configuración de Producción

En producción, se recomienda:

1. Reemplazar los certificados autofirmados por certificados reales (Let's Encrypt, etc.)
2. Configurar HSTS para mayor seguridad
3. Actualizar las configuraciones de seguridad SSL en Apache

---

*Este documento fue creado para ayudar a configurar y mantener HTTPS en todos los contenedores y servicios del proyecto Green Work Page.*
