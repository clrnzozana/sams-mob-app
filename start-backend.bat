@echo off
REM Start SAMS Backend PHP Development Server
REM This runs a PHP server at http://0.0.0.0:8000 (accessible from any device on the network)

cd /d "%~dp0sams-backend"

echo.
echo ============================================
echo  SAMS Backend Development Server
echo ============================================
echo.
echo Server will listen on all interfaces at port 8000
echo Network access: http://192.168.1.7:8000
echo Localhost access: http://localhost:8000
echo.
echo To access from mobile/emulator:
echo  URL: http://192.168.1.7:8000
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

php -S 0.0.0.0:8000

pause
