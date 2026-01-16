Write-Host "Starting Lagentry Backend Server..." -ForegroundColor Green
Set-Location server
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host ""
Write-Host "Starting server on port 3001..." -ForegroundColor Cyan
Write-Host ""
node index.js

