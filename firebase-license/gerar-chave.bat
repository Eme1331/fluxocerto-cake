@echo off
title Gerador de Chave - FluxoCerto Cake
cd /d "%~dp0.."

echo ========================================
echo   Gerador de Chave - FluxoCerto Cake
echo ========================================
echo.
set /p CLI_EMAIL="E-mail do cliente (Enter para pular): "
set /p CLI_NOME="Nome do cliente (Enter para pular): "
set /p CLI_MAQ="Quantidade de aparelhos (Enter = 1): "
if "%CLI_MAQ%"=="" set CLI_MAQ=1

set ARGS=
if not "%CLI_EMAIL%"=="" set ARGS=%ARGS% --email "%CLI_EMAIL%"
if not "%CLI_NOME%"=="" set ARGS=%ARGS% --nome "%CLI_NOME%"
set ARGS=%ARGS% --maquinas %CLI_MAQ%

echo.
node firebase-license\gerar-licenca.mjs %ARGS%

echo.
pause
