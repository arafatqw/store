@echo off
chcp 65001 >nul
echo جاري عمل commit و push للتغييرات...

powershell -ExecutionPolicy Bypass -File "%~dp0git-auto-commit.ps1" -Message "Auto commit: %1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo تم الانتهاء بنجاح!
) else (
    echo.
    echo حدث خطأ!
)

pause

