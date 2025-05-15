#!/bin/bash

echo "Verificando configuración HTTPS en todos los servicios..."
echo "========================================================="

# Verificar API Laravel
echo -n "Comprobando API Laravel (https://localhost:8443): "
if curl -k -s -o /dev/null -w "%{http_code}" https://localhost:8443 | grep -q "200\|301\|302"; then
    echo "✅ OK"
else
    echo "❌ Error"
fi

# Verificar Frontend React
echo -n "Comprobando Frontend React (https://localhost:5173): "
if curl -k -s -o /dev/null -w "%{http_code}" https://localhost:5173 | grep -q "200\|301\|302"; then
    echo "✅ OK"
else
    echo "❌ Error"
fi

# Verificar pgAdmin
echo -n "Comprobando pgAdmin (https://localhost:5050): "
if curl -k -s -o /dev/null -w "%{http_code}" https://localhost:5050 | grep -q "200\|301\|302"; then
    echo "✅ OK"
else
    echo "❌ Error"
fi

# Verificar redirección HTTP a HTTPS
echo -n "Comprobando redirección HTTP a HTTPS: "
if curl -s -o /dev/null -w "%{redirect_url}" http://localhost:8000 | grep -q "^https://"; then
    echo "✅ OK"
else
    echo "❌ Error"
fi

echo ""
echo "Verificación completa. Para más detalles consulta HTTPS-CONFIG.md"
