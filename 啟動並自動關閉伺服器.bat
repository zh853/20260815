@echo off
chcp 65001 > nul
title ArchSystems 事務所整合系統 (網頁與連入 IP 監控控制台)

echo ========================================================================
echo   ArchSystems 建築師事務所三位一體整合系統 (ERP)
echo   【伺服器啟動 · 連入 IP 監控 · 關閉時自動終止伺服器】
echo ========================================================================
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
echo ========================================================================
echo   [系統運行中] 網頁伺服器已成功開啟並監聽中！
echo.
echo   【本機存取網址】:  http://localhost:3000
echo   【區網/VPN存取】:
powershell -ExecutionPolicy Bypass -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { `$_.IPAddress -notlike '127*' -and `$_.IPAddress -notlike '169.254*' } | ForEach-Object { Write-Host ('                   http://' + `$_.IPAddress + ':3000') }"
echo.
echo   🔒【安全說明】:
echo      網站開放連入供同仁手機打卡與工時算帳。若需從外勤遠端存取，
echo      建議透過 VPN 專線連入上述區網 IP，兼顧存取便利與資安防護。
echo.
echo   ★【連入監控】: 終端機與網頁視窗 (頂部「伺服器狀態」按鈕) 將即時印出連入 IP。
echo   ★【自動關閉】: 使用完畢後，按下【任意鍵】或關閉視窗，將自動關閉 3000 伺服器。
echo ========================================================================
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
