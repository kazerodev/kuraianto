@echo off
chcp 65001 >nul
title Subir mejoras de kuraianto.com a GitHub
cd /d "%USERPROFILE%\kuraianto"

echo.
echo ============================================
echo   Subiendo las mejoras de kuraianto.com
echo ============================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no esta instalado en este ordenador.
  echo Descargalo en https://git-scm.com y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

echo Estos son los archivos que se van a subir:
echo.
git status --short
echo.

git add -A
git commit -m "Mejoras web: consentimiento de cookies real, CRM fuera del sitio publico, pagina 404, datos legales y division del bundle" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015gAvaV9uyNsjJu2aeFmfsE"

if errorlevel 1 (
  echo.
  echo No habia nada nuevo que guardar, o el commit fallo.
  echo.
)

echo.
echo Subiendo a GitHub...
echo.
git push origin master

if errorlevel 1 (
  echo.
  echo ============================================
  echo   NO SE PUDO SUBIR
  echo ============================================
  echo.
  echo Lo mas probable es que Git te pida iniciar sesion en GitHub.
  echo Si se ha abierto una ventana de GitHub, entra con tu cuenta
  echo y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   LISTO
echo ============================================
echo.
echo Los cambios estan en GitHub. Vercel publica la web
echo automaticamente en uno o dos minutos.
echo.
echo Comprueba luego kuraianto.com/crm : debe dar pagina no encontrada.
echo.
pause
