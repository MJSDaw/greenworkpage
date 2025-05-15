# Scripts de utilidad para Green Work Page

Esta carpeta contiene scripts útiles para gestionar el proyecto Green Work Page:

## Scripts Disponibles

### Scripts de Inicio

- **start-project.sh** / **start-project.bat**: Inicia todos los servicios del proyecto
- **docker-entrypoint.sh**: Script de entrada para el contenedor Laravel

### Scripts HTTPS

- **check-https.sh** / **check-https.bat**: Verifica la configuración HTTPS de todos los servicios
- **generate-ssl.sh**: Genera certificados SSL autofirmados para el proyecto
- **restart-https.sh** / **restart-https.bat**: Reinicia todos los servicios con la configuración HTTPS
- **verify-https.sh**: Realiza validaciones adicionales de la configuración HTTPS

## Cómo usar los scripts

### En Linux/macOS

```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh

# Iniciar el proyecto
./scripts/start-project.sh

# Verificar HTTPS
./scripts/check-https.sh
```

### En Windows

```powershell
# Iniciar el proyecto
.\scripts\start-project.bat

# Verificar HTTPS
.\scripts\check-https.bat
```
