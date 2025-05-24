#!/bin/bash

# verify that the script is run with correct arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 backup_file_name.sql.gz"
    echo "Example: $0 greenworkdb_backup_20250516_084943.sql.gz"
    echo "Available files:"
    ls -la /backups/*.gz
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_PATH="/backups/$BACKUP_FILE"
SQL_FILE="${BACKUP_PATH%.gz}"

# verify that the backup file exists
if [ ! -f "$BACKUP_PATH" ]; then
    echo "Error: The file $BACKUP_PATH does not exist"
    echo "Available files:"
    ls -la /backups/*.gz
    exit 1
fi

echo "Decompressing $BACKUP_PATH..."
gunzip -c "$BACKUP_PATH" > "$SQL_FILE"

echo "Restoring database from $SQL_FILE..."
PGPASSWORD=$PGPASSWORD psql -h postgres -U greenworkAdmin -d greenworkdb -f "$SQL_FILE"

echo "Cleaning up temporary files..."
rm "$SQL_FILE"

echo "Restoration completed successfully!"
