Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Storeee Inventory System - Laravel" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Laravel Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Storeee\backend; php artisan serve --host=0.0.0.0 --port=8000"

Start-Sleep -Seconds 3

Write-Host "Starting React Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Storeee\client; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers Starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Laravel Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "React Frontend:  https://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For Mobile Access:" -ForegroundColor Green
Write-Host "React Frontend:  https://192.168.1.106:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: HTTPS is enabled for camera access" -ForegroundColor Yellow
Write-Host "   Chrome on mobile needs HTTPS for camera!" -ForegroundColor Yellow
Write-Host "   You may need to accept the certificate warning on mobile." -ForegroundColor Yellow
Write-Host ""
Write-Host "Make sure both devices are on the same Wi-Fi network!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

