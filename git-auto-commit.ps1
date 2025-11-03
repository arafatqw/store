# Script تلقائي لعمل commit و push للتغييرات

param(
    [string]$Message = "Auto commit: Updates at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

# التحقق من وجود Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git غير مثبت!" -ForegroundColor Red
    exit 1
}

# الانتقال إلى المجلد الرئيسي
$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

# التحقق من حالة Git
Write-Host "جاري فحص التغييرات..." -ForegroundColor Yellow
$status = git status --short

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "لا توجد تغييرات للعمل commit عليها" -ForegroundColor Green
    exit 0
}

# عرض التغييرات
Write-Host "`nالتغييرات الموجودة:" -ForegroundColor Cyan
git status --short

# إضافة جميع التغييرات
Write-Host "`nجاري إضافة التغييرات..." -ForegroundColor Yellow
git add -A

# عمل commit
Write-Host "جاري عمل commit..." -ForegroundColor Yellow
git commit -m $Message

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nتم عمل commit بنجاح!" -ForegroundColor Green
    
    # محاولة عمل push
    Write-Host "جاري عمل push إلى GitHub..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nتم push التغييرات إلى GitHub بنجاح!" -ForegroundColor Green
    } else {
        Write-Host "`nفشل push التغييرات. تحقق من الاتصال بـ GitHub" -ForegroundColor Red
    }
} else {
    Write-Host "`nفشل عمل commit" -ForegroundColor Red
    exit 1
}

