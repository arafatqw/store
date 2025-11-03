@echo off
echo ========================================
echo   Storeee Inventory System - Laravel
echo ========================================
echo.

echo Starting Laravel Backend...
start "Laravel Server" cmd /k "cd /d C:\Storeee\backend && php artisan serve --host=0.0.0.0 --port=8000"

timeout /t 3 /nobreak >nul

echo Starting React Frontend...
start "React Frontend" cmd /k "cd /d C:\Storeee\client && npm run dev"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo Laravel Backend: http://localhost:8000
echo React Frontend:  http://localhost:3000
echo.
echo For Mobile Access:
echo React Frontend:  http://192.168.1.106:3000
echo.
echo Make sure both devices are on the same Wi-Fi network!
echo.
pause

