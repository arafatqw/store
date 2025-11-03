@echo off
echo Starting Storeee Inventory System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && node server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause
