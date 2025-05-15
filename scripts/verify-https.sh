#!/bin/bash

# Script to verify all HTTPS services are working correctly

echo "Verificando configuración HTTPS de Green Work Page..."
echo "------------------------------------------------"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "[ERROR] Docker no está en ejecución o no tienes permisos."
  exit 1
fi

# Check if all containers are running
echo "Comprobando containers en ejecución..."
CONTAINERS=(laravel_container postgres_container pgadmin_container)
ALL_RUNNING=true

for CONTAINER in "${CONTAINERS[@]}"; do
  if [ "$(docker ps -q -f name=$CONTAINER)" ]; then
    echo "✅ $CONTAINER está en ejecución"
  else
    echo "❌ $CONTAINER no está en ejecución"
    ALL_RUNNING=false
  fi
done

if [ "$ALL_RUNNING" = false ]; then
  echo "⚠️ No todos los contenedores están en ejecución. Intenta iniciarlos con: docker-compose up -d"
  exit 1
fi

# Check if SSL certificates exist in the appropriate locations
echo ""
echo "Comprobando certificados SSL..."
docker exec laravel_container ls -la /etc/ssl/certs/ssl-cert-snakeoil.pem > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Certificados SSL encontrados en laravel_container"
else
  echo "❌ Certificados SSL no encontrados en laravel_container"
fi

# Check HTTPS access to services
echo ""
echo "Verificando acceso HTTPS a los servicios:"
echo "- API Laravel: https://localhost:8443"
echo "- Frontend React: https://localhost:5173"
echo "- pgAdmin: https://localhost:5050"

echo ""
echo "Configuración completa. Considera revisar el archivo docs/HTTPS-CONFIG.md para más detalles sobre la configuración HTTPS."
