#!/bin/bash

# Script to start the GreenWork project with the new structure
echo "Starting GreenWork project..."
echo "============================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "[ERROR] Docker no está en ejecución. Por favor, inicia Docker primero."
  exit 1
fi

# Build and start all containers
echo "Iniciando contenedores..."
docker-compose down
docker-compose build
docker-compose up -d

echo ""
echo "Proyecto iniciado correctamente! Puedes acceder a:"
echo "- Frontend: https://localhost:5173"
echo "- API: https://localhost:8443"
echo "- pgAdmin: https://localhost:5050"
echo ""
echo "Para verificar la configuración HTTPS, ejecuta: ./scripts/check-https.sh"
