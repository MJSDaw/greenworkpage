#!/bin/bash

# Variables configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/greenworkdb_backup_$TIMESTAMP.sql"

# Make sure the backup directory exists
mkdir -p $BACKUP_DIR

# Backup the database
pg_dump -h postgres -U greenworkAdmin -d greenworkdb -F p > $BACKUP_FILE

# Zip the backup file
gzip $BACKUP_FILE

echo "Backup completed: ${BACKUP_FILE}.gz"

# Delete backups older than 7 days
find $BACKUP_DIR -name "greenworkdb_backup_*.sql.gz" -type f -mtime +7 -delete
