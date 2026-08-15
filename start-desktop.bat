@echo off
chcp 65001 > nul
title ArchSystems 事務所整合系統 - 桌面瀏覽器啟動器

echo ========================================================
echo   ArchSystems 建築師事務所三位一體整合系統 (桌面模式)
echo ========================================================
echo.
echo [1/2] 正在啟動桌面伺服器 (Vite Server)...

start /b npm run dev

echo [2/2] 正在等待伺服器準備完畢 (http://localhost:3000)...
timeout /t 3 /nobreak > nul

echo.
echo [成功] 正在開啟桌面瀏覽器全螢幕模式...
start msedge --app=http://localhost:3000 || start chrome --app=http://localhost:3000 || start http://localhost:3000

echo.
echo 系統已於桌面瀏覽器視窗中啟動！請勿關閉此控制台視窗。
echo 按任意鍵關閉伺服器...
pause > nul
