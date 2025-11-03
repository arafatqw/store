@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    جاري حفظ التغييرات على GitHub
echo ========================================
echo.

cd /d "%~dp0"

git add -A
git commit -m "Update: %date% %time%"
git push

echo.
echo ========================================
echo    تم الحفظ بنجاح!
echo ========================================
echo.
pause

