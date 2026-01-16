@echo off
echo Starting Lagentry Backend Server...
cd server
echo Installing dependencies...
call npm install
echo.
echo Starting server on port 3001...
echo.
node index.js
pause

