@echo off
REM Script to set up project structure correctly

echo Configurando estructura del proyecto Green Work Page...
echo ======================================================

REM Create necessary directories if they don't exist
echo Verificando directorios...
if not exist config mkdir config
if not exist docs mkdir docs
if not exist scripts mkdir scripts
if not exist ssl mkdir ssl

REM Move any config files that might be in the wrong place
if exist 000-default.conf (
    if not exist config\000-default.conf (
        echo Moviendo 000-default.conf a directorio config...
        move 000-default.conf config\
    )
)

if exist pgadmin.json (
    if not exist config\pgadmin.json (
        echo Moviendo pgadmin.json a directorio config...
        move pgadmin.json config\
    )
)

REM Move any documentation files
if exist HTTPS-CONFIG.md (
    if not exist docs\HTTPS-CONFIG.md (
        echo Moviendo HTTPS-CONFIG.md a directorio docs...
        move HTTPS-CONFIG.md docs\
    )
)

if exist HTTPS-SUMMARY.md (
    if not exist docs\HTTPS-SUMMARY.md (
        echo Moviendo HTTPS-SUMMARY.md a directorio docs...
        move HTTPS-SUMMARY.md docs\
    )
)

REM Move any scripts
if exist check-https.sh (
    if not exist scripts\check-https.sh (
        echo Moviendo check-https.sh a directorio scripts...
        move check-https.sh scripts\
    )
)

if exist restart-https.sh (
    if not exist scripts\restart-https.sh (
        echo Moviendo restart-https.sh a directorio scripts...
        move restart-https.sh scripts\
    )
)

if exist verify-https.sh (
    if not exist scripts\verify-https.sh (
        echo Moviendo verify-https.sh a directorio scripts...
        move verify-https.sh scripts\
    )
)

if exist generate-ssl.sh (
    if not exist scripts\generate-ssl.sh (
        echo Moviendo generate-ssl.sh a directorio scripts...
        move generate-ssl.sh scripts\
    )
)

echo.
echo Estructura de directorios configurada correctamente.
echo.
echo Puedes iniciar el proyecto ejecutando:
echo   scripts\start-project.bat

pause
