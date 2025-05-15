#!/bin/bash

# Script para reiniciar todos los servicios con la configuración HTTPS

echo "Reiniciando servicios con configuración HTTPS..."
echo "================================================"

# Detener todos los contenedores
echo "Deteniendo contenedores..."
docker-compose down

# Generar certificados SSL si no existen
echo "Verificando/generando certificados SSL..."
./scripts/generate-ssl.sh

# Reconstruir las imágenes con las nuevas configuraciones
echo "Reconstruyendo imágenes..."
docker-compose build

# Iniciar todos los servicios
echo "Iniciando servicios con configuración HTTPS..."
docker-compose up -d

# Esperar a que los servicios estén disponibles
echo "Esperando a que los servicios estén disponibles..."
sleep 10

# Verificar la configuración HTTPS
echo "Verificando configuración HTTPS..."
./check-https.sh

echo ""
echo "Proceso completado. Todos los servicios deberían estar ejecutándose con HTTPS."
echo "Puedes acceder a:"
echo "- Frontend: https://localhost:5173"
echo "- API: https://localhost:8443"
echo "- pgAdmin: https://localhost:5050"
