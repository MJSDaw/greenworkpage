# Sistema de Copias de Seguridad de Base de Datos

Este sistema permite realizar copias de seguridad automáticas y restauraciones de la base de datos PostgreSQL.

## Ubicación de las copias de seguridad

Las copias de seguridad se almacenan en dos ubicaciones (para mayor seguridad):
- Dentro del contenedor: `/var/www/html/storage/app/backups/`
- En el directorio raíz del proyecto: `/var/www/html/backups/` (o `./backups/` desde la perspectiva del host)
- Estos directorios están sincronizados para que todas las copias se mantengan en ambas ubicaciones

Los nombres de los archivos de copia de seguridad incluyen la fecha y hora de creación: `backup_YYYY-MM-DD_HH-mm-ss.sql`

## Comandos disponibles

### Realizar una copia de seguridad manual

```bash
php artisan db:backup
```

### Restaurar desde una copia de seguridad

```bash
# Listar todas las copias disponibles y seleccionar una
php artisan db:restore

# Especificar el nombre del archivo directamente
php artisan db:restore backup_2025-05-14_10-00-00.sql
```

## Copias de seguridad automáticas

El sistema está configurado para:
- Realizar copias de seguridad automáticas todos los días a las 13:00 (1:00 PM) hora local.
- Conservar solamente las 2 copias de seguridad más recientes, eliminando las más antiguas automáticamente.

## Configuración

La configuración de las copias de seguridad se puede ajustar en:
- `app/Console/Kernel.php` - Programación de las tareas
- `app/Console/Commands/DatabaseBackup.php` - Lógica de copias de seguridad
- `app/Console/Commands/DatabaseRestore.php` - Lógica de restauración

## Seguridad

- Las copias de seguridad contienen datos sensibles. Asegúrese de proteger adecuadamente el acceso a estos archivos.
- Se recomienda además realizar copias periódicas en almacenamiento externo o en la nube para mayor seguridad.

## Solución de problemas

Si encuentra problemas con las copias de seguridad:
1. Verifique los logs de la aplicación en `storage/logs/laravel.log`
2. Asegúrese de que el contenedor tenga permisos de escritura en ambos directorios de backups
3. Compruebe que PostgreSQL está en funcionamiento y accesible

### Herramienta de diagnóstico

Para diagnosticar problemas con las copias de seguridad:

```bash
php artisan db:backup:list
```

Este comando muestra:
- Listado completo de archivos de respaldo existentes con tamaño y fecha
- Información sobre el entorno y permisos
- Diagnóstico sobre la capacidad de escritura
- Verifica todas las ubicaciones de respaldo configuradas

### Posibles problemas comunes

- **No se detectan las copias de seguridad**: El sistema ahora busca en múltiples ubicaciones. Si sigue sin encontrar los archivos, ejecute `db:backup:list` para ver detalles.
- **Errores de permisos**: Asegúrese que el usuario del contenedor tiene permisos de escritura en `/var/www/html/storage/app/backups` y `/var/www/html/backups`.
- **Duplicidad de archivos**: Es normal ver el mismo archivo en ambas ubicaciones, esto es parte del diseño de seguridad.
