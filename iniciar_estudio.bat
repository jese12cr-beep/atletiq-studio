@echo off
title ATLETIQ Sport Custom Studio - Servidor Local Independiente
cd /d "%~dp0"

echo ========================================================
echo    ATLETIQ - CONFIGURADOR 3D DEPORTIVO ^& LIGA MX
echo ========================================================
echo.
echo 1. Comprobando dependencias...
if not exist node_modules (
  echo Instalando dependencias necesarias...
  call npm install
)

echo 2. Iniciando servidor web de produccion...
start "" "http://localhost:4173"
call npm run preview -- --port 4173 --host

pause
