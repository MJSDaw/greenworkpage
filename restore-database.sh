#!/bin/bash

# Verificar que se proporcionó un archivo de backup
if [ "$#" -ne 1 ]; then
    echo "Uso: $0 nombre_del_archivo_backup.sql.gz"
    echo "Ejemplo: $0 greenworkdb_backup_20250516_084943.sql.gz"
    echo "Archivos disponibles:"
    ls -la /backups/*.gz
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_PATH="/backups/$BACKUP_FILE"
SQL_FILE="${BACKUP_PATH%.gz}"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_PATH" ]; then
    echo "Error: El archivo $BACKUP_PATH no existe"
    echo "Archivos disponibles:"
    ls -la /backups/*.gz
    exit 1
fi

echo "Descomprimiendo $BACKUP_PATH..."
gunzip -c "$BACKUP_PATH" > "$SQL_FILE"

echo "Restaurando la base de datos desde $SQL_FILE..."
PGPASSWORD=$PGPASSWORD psql -h postgres -U greenworkAdmin -d greenworkdb -f "$SQL_FILE"

echo "Limpiando archivos temporales..."
rm "$SQL_FILE"

echo "Restauración completada con éxito!"
