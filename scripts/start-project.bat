@echo off
echo Starting GreenWork project...
echo ============================

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Docker no esta en ejecucion. Por favor, inicia Docker primero.
  exit /b 1
)

REM Build and start all containers
echo Iniciando contenedores...
docker-compose down
docker-compose build
docker-compose up -d

echo.
echo Proyecto iniciado correctamente! Puedes acceder a:
echo - Frontend: https://localhost:5173
echo - API: https://localhost:8443
echo - pgAdmin: https://localhost:5050
echo.
echo Para verificar la configuracion HTTPS, ejecuta: scripts\check-https.bat

pause
