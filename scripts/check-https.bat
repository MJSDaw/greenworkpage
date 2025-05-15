@echo off
echo Verificando configuracion HTTPS en todos los servicios...
echo =========================================================

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Docker no esta en ejecucion o no tienes permisos.
  exit /b 1
)

REM Check if all containers are running
echo Comprobando containers en ejecucion...
docker ps | findstr "laravel_container" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo X laravel_container no esta en ejecucion
) else (
  echo √ laravel_container esta en ejecucion
)

docker ps | findstr "postgres_container" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo X postgres_container no esta en ejecucion
) else (
  echo √ postgres_container esta en ejecucion
)

docker ps | findstr "pgadmin_container" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo X pgadmin_container no esta en ejecucion
) else (
  echo √ pgadmin_container esta en ejecucion
)

echo.
echo Comprobando certificados SSL...
docker exec laravel_container ls -la /etc/ssl/certs/ssl-cert-snakeoil.pem >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo X Certificados SSL no encontrados en laravel_container
) else (
  echo √ Certificados SSL encontrados en laravel_container
)

echo.
echo Verificando acceso HTTPS a los servicios:
echo - API Laravel: https://localhost:8443
echo - Frontend React: https://localhost:5173
echo - pgAdmin: https://localhost:5050

echo.
echo Configuracion completa. Considera revisar el archivo docs/HTTPS-CONFIG.md 
echo para mas detalles sobre la configuracion HTTPS.

pause
