@echo off
chcp 65001 > nul
title ArchSystems 事務所整合系統 (自動關閉伺服器模式)

echo ========================================================
echo   ArchSystems 建築師事務所三位一體整合系統
echo   【網頁與伺服器一鍵啟動 / 關閉時自動停止伺服器】
echo ========================================================
echo.

:: 1. 檢查 3000 通訊埠，若舊伺服器仍在執行則先進行清理
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo [資訊] 偵測到舊有伺服器進程 (PID: %%a)，正在進行清理...
    taskkill /F /PID %%a >nul 2>&1
)

echo [1/3] 正在啟動 Vite 網頁伺服器 (Port: 3000)...
start /b "" npx.cmd vite --port 3000 --host 0.0.0.0

echo [2/3] 等待伺服器就緒中 (3秒)...
timeout /t 3 /nobreak > nul

echo [3/3] 正在開啟預設網頁瀏覽器 (http://localhost:3000)...
start "" "http://localhost:3000"

echo.
echo ========================================================
echo   [系統運行中] 網頁已成功開啟！
echo.
echo   ★ 提示：使用完畢後，請按下【任意鍵】或關閉此控制台視窗，
echo          系統將會自動終止背景 Vite 網頁伺服器。
echo ========================================================
echo.
pause

echo.
echo [結束中] 正在關閉 Vite 網頁伺服器...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [成功] 已安全關閉伺服器進程 (PID: %%a)。
)

echo [完成] 伺服器已成功關閉。視窗將於 2 秒後自動離開...
timeout /t 2 /nobreak > nul
