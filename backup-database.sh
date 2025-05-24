#!/bin/bash

# Variables configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/greenworkdb_backup_$TIMESTAMP.sql"

# Make sure the backup directory exists
mkdir -p $BACKUP_DIR

# Backup the database
echo "Starting backup at $(date)"
PGPASSWORD=${PGPASSWORD} pg_dump -h postgres -U greenworkAdmin -d greenworkdb -F p > $BACKUP_FILE
if [ $? -ne 0 ]; then
    echo "Error: Database backup failed!"
    exit 1
fi

# Zip the backup file
echo "Compressing backup file..."
gzip $BACKUP_FILE
if [ $? -ne 0 ]; then
    echo "Error: Failed to compress backup file!"
    exit 1
fi

echo "Backup completed: ${BACKUP_FILE}.gz"

# Delete backups older than 7 days
find $BACKUP_DIR -name "greenworkdb_backup_*.sql.gz" -type f -mtime +7 -delete
