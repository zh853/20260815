@echo off
chcp 65001 > nul
title ArchSystems 事務所整合系統 啟動器

echo ========================================================
echo   ArchSystems 建築師事務所三位一體整合系統
echo ========================================================
echo.

:: 檢查 3000 通訊埠是否已經開啟
netstat -ano | findstr ":3000 " > nul
if %errorlevel% equ 0 (
    echo [資訊] 網頁伺服器已在背景運行中！
) else (
    echo [1/2] 正在啟動網頁伺服器 (http://localhost:3000)...
    start /b "" npx.cmd vite --port 3000 --host 0.0.0.0
    timeout /t 3 /nobreak > nul
)

echo [2/2] 正在為您開啟網頁瀏覽器...
start "" "http://localhost:3000"

echo.
echo ========================================================
echo [成功] 系統已成功開啟！
echo 網址: http://localhost:3000
echo.
echo 提示: 使用完畢後按下【任意鍵】，系統將自動清理關閉伺服器。
echo ========================================================
echo.
pause

echo.
echo 正在停止 3000 通訊埠之網頁伺服器...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [成功] 已關閉伺服器進程 (PID: %%a)。
)

echo [完成] 伺服器已成功關閉。
timeout /t 2 /nobreak > nul
