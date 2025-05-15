# Archivos de Configuración para Green Work Page

Esta carpeta contiene los archivos de configuración para los distintos servicios del proyecto:

## Archivos de Configuración

- **000-default.conf**: Configuración de Apache para el servidor Laravel, incluye configuración HTTPS
- **pgadmin.json**: Configuración para pgAdmin, incluye configuración TLS/SSL

## Uso de estos archivos

Estos archivos son utilizados por los contenedores Docker durante el despliegue. Si necesitas modificar la configuración:

1. Edita el archivo correspondiente en esta carpeta
2. Reconstruye los contenedores con:

```bash
# En Linux/macOS
./scripts/start-project.sh

# En Windows
.\scripts\start-project.bat
```

## Configuración HTTPS

Para más detalles sobre la configuración HTTPS, consulta la documentación en la carpeta `docs`:

- `docs/HTTPS-CONFIG.md`
- `docs/HTTPS-SUMMARY.md`
