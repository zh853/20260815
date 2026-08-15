@echo off
chcp 65001 > nul
title ArchSystems 事務所整合系統 - 桌面瀏覽器啟動器

echo ========================================================================
echo   ArchSystems 建築師事務所三位一體整合系統 (桌面模式)
echo ========================================================================
echo.

:: 檢查 3000 通訊埠是否已經開啟
netstat -ano | findstr ":3000 " > nul
if %errorlevel% equ 0 (
    echo [資訊] 網頁伺服器已在背景運行中！
) else (
    echo [1/2] 正在啟動桌面伺服器 (Vite Server)...
    start /b "" npx.cmd vite --port 3000 --host 0.0.0.0
    timeout /t 3 /nobreak > nul
)

echo [2/2] 正在開啟桌面瀏覽器應用程式模式 (http://localhost:3000)...
start msedge --app=http://localhost:3000 2>nul || start chrome --app=http://localhost:3000 2>nul || start http://localhost:3000

echo.
echo ========================================================================
echo   [成功] 系統已於桌面瀏覽器視窗中啟動！
echo.
echo   【本機網址】: http://localhost:3000
echo   【區網/VPN網址】:
powershell -ExecutionPolicy Bypass -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { `$_.IPAddress -notlike '127*' -and `$_.IPAddress -notlike '169.254*' } | ForEach-Object { Write-Host ('                 http://' + `$_.IPAddress + ':3000') }"
echo.
echo   ★ 提示：使用完畢後按下【任意鍵】，系統將自動關閉背景伺服器。
echo ========================================================================
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
