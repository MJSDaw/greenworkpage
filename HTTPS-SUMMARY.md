# Configuración HTTPS para Green Work Page

Este documento proporciona un resumen de todas las configuraciones HTTPS implementadas en el proyecto Green Work Page. Todos los contenedores y rutas ahora están configurados para utilizar HTTPS de forma exclusiva.

## Configuración HTTPS por Componente

### 1. Laravel API

- **Todas las URLs generadas usan HTTPS:** Se configuró `URL::forceScheme('https')` en `AppServiceProvider.php`
- **Redirección HTTP a HTTPS:** Configurado en el virtual host de Apache
- **Cookies seguras:** La configuración de sesión ahora usa `'secure' => true` 
- **CORS configurado para HTTPS:** Limitando los orígenes a dominios HTTPS

### 2. PostgreSQL

- **SSL habilitado:** Modo SSL establecido a 'require' en la configuración de la base de datos
- **Certificados SSL:** Montados desde el volumen compartido ssl_certs

### 3. React Frontend

- **Servidor de desarrollo HTTPS:** Vite configurado para usar HTTPS con certificados SSL
- **API Proxy seguro:** Configurado para comunicarse con la API a través de HTTPS

### 4. pgAdmin

- **Interfaz web HTTPS:** TLS habilitado con certificados apropiados
- **Conexiones seguras:** Configurado para conectarse a PostgreSQL con SSL

## Cambios específicos realizados

1. **Laravel**:
   - Forzado HTTPS en AppServiceProvider
   - Cookies seguras en config/session.php
   - Base de datos con SSL en config/database.php
   - CORS configurado para dominios HTTPS

2. **Apache**:
   - Virtual host HTTP redirige a HTTPS
   - Configuración SSL mejorada con cifrados seguros
   - Encabezados HSTS para mayor seguridad

3. **Docker Compose**:
   - Volumen ssl_certs compartido entre servicios
   - Variables de entorno para forzar HTTPS
   - Configuración de PostgreSQL con SSL

4. **Docker & Scripts**:
   - Generación automática de certificados SSL
   - Script de verificación de configuración HTTPS

## Consideraciones de seguridad

- Los certificados autofirmados son adecuados para desarrollo, pero para producción se recomienda usar certificados reales (Let's Encrypt)
- Se ha implementado HSTS para mayor seguridad
- Se han deshabilitado protocolos SSL antiguos e inseguros

## Pruebas

Para verificar que todos los servicios estén usando HTTPS correctamente:

```bash
./check-https.sh
```

## Referencias

- [Laravel HTTPS Docs](https://laravel.com/docs/security)
- [PostgreSQL SSL Docs](https://www.postgresql.org/docs/current/ssl-tcp.html)
- [Vite HTTPS Config](https://vitejs.dev/config/server-options.html#server-https)
