#!/bin/bash

# Configuración de variables
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/greenworkdb_backup_$TIMESTAMP.sql"

# Asegurar que el directorio de backups existe
mkdir -p $BACKUP_DIR

# Realizar el backup de la base de datos usando la herramienta pg_dump de PostgreSQL
pg_dump -h postgres -U greenworkAdmin -d greenworkdb -F p > $BACKUP_FILE

# Comprimir el archivo de backup para ahorrar espacio
gzip $BACKUP_FILE

echo "Backup completado: ${BACKUP_FILE}.gz"

# Eliminar backups antiguos (mantener solo los últimos 7 días)
find $BACKUP_DIR -name "greenworkdb_backup_*.sql.gz" -type f -mtime +7 -delete
