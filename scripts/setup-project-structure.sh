#!/bin/bash
# Script to set up project structure correctly

echo "Configurando estructura del proyecto Green Work Page..."
echo "======================================================"

# Create necessary directories if they don't exist
echo "Verificando directorios..."
mkdir -p config
mkdir -p docs
mkdir -p scripts
mkdir -p ssl

# Move any config files that might be in the wrong place
if [ -f "000-default.conf" ] && [ ! -f "config/000-default.conf" ]; then
    echo "Moviendo 000-default.conf a directorio config..."
    mv 000-default.conf config/
fi

if [ -f "pgadmin.json" ] && [ ! -f "config/pgadmin.json" ]; then
    echo "Moviendo pgadmin.json a directorio config..."
    mv pgadmin.json config/
fi

# Move any documentation files
if [ -f "HTTPS-CONFIG.md" ] && [ ! -f "docs/HTTPS-CONFIG.md" ]; then
    echo "Moviendo HTTPS-CONFIG.md a directorio docs..."
    mv HTTPS-CONFIG.md docs/
fi

if [ -f "HTTPS-SUMMARY.md" ] && [ ! -f "docs/HTTPS-SUMMARY.md" ]; then
    echo "Moviendo HTTPS-SUMMARY.md a directorio docs..."
    mv HTTPS-SUMMARY.md docs/
fi

# Move any scripts
if [ -f "check-https.sh" ] && [ ! -f "scripts/check-https.sh" ]; then
    echo "Moviendo check-https.sh a directorio scripts..."
    mv check-https.sh scripts/
fi

if [ -f "restart-https.sh" ] && [ ! -f "scripts/restart-https.sh" ]; then
    echo "Moviendo restart-https.sh a directorio scripts..."
    mv restart-https.sh scripts/
fi

if [ -f "verify-https.sh" ] && [ ! -f "scripts/verify-https.sh" ]; then
    echo "Moviendo verify-https.sh a directorio scripts..."
    mv verify-https.sh scripts/
fi

if [ -f "generate-ssl.sh" ] && [ ! -f "scripts/generate-ssl.sh" ]; then
    echo "Moviendo generate-ssl.sh a directorio scripts..."
    mv generate-ssl.sh scripts/
fi

# Set permissions on scripts
echo "Configurando permisos de ejecución para scripts..."
chmod +x scripts/*.sh

echo ""
echo "Estructura de directorios configurada correctamente."
echo ""
echo "Puedes iniciar el proyecto ejecutando:"
echo "  ./scripts/start-project.sh (Linux/macOS)"
echo "  scripts\start-project.bat (Windows)"
