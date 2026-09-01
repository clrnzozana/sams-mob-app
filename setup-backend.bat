@echo off
REM Setup SAMS Backend Database and Environment
REM This script creates a .env file and prepares the PHP environment

cd /d "%~dp0sams-backend"

echo.
echo ============================================
echo  SAMS Backend Setup
echo ============================================
echo.

REM Check if .env exists
if exist .env (
    echo .env file already exists. Skipping creation.
) else (
    echo Creating .env file from .env.example...
    
    REM Copy template
    copy .env.example .env
    
    echo.
    echo IMPORTANT: Edit the following file and add your database credentials:
    echo   File: %cd%\.env
    echo.
    echo Required settings:
    echo   SAMS_DB_USER=your-database-user
    echo   SAMS_DB_PASSWORD=your-database-password
    echo.
    echo Common configurations:
    echo   - MySQL root (no password):
    echo     SAMS_DB_USER=root
    echo     SAMS_DB_PASSWORD=
    echo.
    echo   - MySQL/MariaDB with credentials:
    echo     SAMS_DB_USER=sams
    echo     SAMS_DB_PASSWORD=sams
    echo.
    echo After editing .env, close this window and run:
    echo   npm run start-backend
    echo.
    
    REM Open .env in default editor
    start notepad .env
)

echo.
echo ============================================
echo  Next Steps:
echo ============================================
echo.
echo 1. Edit .env with your database credentials
echo.
echo 2. Ensure MySQL/MariaDB is running
echo.
echo 3. Create database and import schema:
echo    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \`sams-db\`;"
echo    mysql -u root -p sams-db ^< ../sams-db.sql
echo.
echo 4. Start PHP backend:
echo    npm run start-backend
echo.
echo ============================================
echo.

pause
