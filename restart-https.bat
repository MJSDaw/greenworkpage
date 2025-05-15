@echo off
setlocal enabledelayedexpansion

echo Reiniciando servicios con configuracion HTTPS...
echo ================================================

REM Detener todos los contenedores
echo Deteniendo contenedores...
docker-compose down

REM Generar certificados SSL mediante Docker
echo Generando certificados SSL...
docker run --rm -v %cd%\ssl:/ssl alpine /bin/sh -c "mkdir -p /ssl/certs /ssl/private && cd /ssl && [ ! -f certs/server.crt ] && apk add --no-cache openssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout private/server.key -out certs/server.crt -subj '/C=ES/ST=State/L=City/O=Organization/CN=greenwork.local' && cp certs/server.crt certs/ssl-cert-snakeoil.pem && cp private/server.key private/ssl-cert-snakeoil.key || echo 'SSL certificates already exist.'"

REM Reconstruir las imágenes con las nuevas configuraciones
echo Reconstruyendo imagenes...
docker-compose build

REM Iniciar todos los servicios
echo Iniciando servicios con configuracion HTTPS...
docker-compose up -d

REM Esperar a que los servicios estén disponibles
echo Esperando a que los servicios esten disponibles...
timeout /t 10 /nobreak

REM Verificar la configuración HTTPS
echo Verificando configuracion HTTPS...
docker run --rm --network host curlimages/curl:latest /bin/sh -c "echo -n 'Comprobando API Laravel: ' && curl -k -s -o /dev/null -w %%{http_code} https://localhost:8443 | grep -q '200\|301\|302' && echo OK || echo Error"
docker run --rm --network host curlimages/curl:latest /bin/sh -c "echo -n 'Comprobando Frontend React: ' && curl -k -s -o /dev/null -w %%{http_code} https://localhost:5173 | grep -q '200\|301\|302' && echo OK || echo Error"
docker run --rm --network host curlimages/curl:latest /bin/sh -c "echo -n 'Comprobando pgAdmin: ' && curl -k -s -o /dev/null -w %%{http_code} https://localhost:5050 | grep -q '200\|301\|302' && echo OK || echo Error"

echo.
echo Proceso completado. Todos los servicios deberian estar ejecutandose con HTTPS.
echo Puedes acceder a:
echo - Frontend: https://localhost:5173
echo - API: https://localhost:8443
echo - pgAdmin: https://localhost:5050

pause
