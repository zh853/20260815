# ArchSystems 伺服器與連入 IP 監控啟動腳本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  ArchSystems 建築師事務所三位一體整合系統 (ERP)" -ForegroundColor Yellow
Write-Host "  【伺服器啟動 · 連入 IP 監控 · 關閉時自動終止伺服器】" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. 檢查 3000 通訊埠，清理舊進程
$listeningPort = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($listeningPort) {
    Write-Host "[資訊] 偵測到舊有伺服器進程 (PID: $($listeningPort.OwningProcess))，正在關閉..." -ForegroundColor DarkYellow
    Stop-Process -Id $listeningPort.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host "[1/3] 正在啟動 Vite 網頁伺服器 (Port: 3000)..." -ForegroundColor Gray
$serverProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "vite --port 3000 --host 0.0.0.0" -PassThru -NoNewWindow

Write-Host "[2/3] 等待伺服器就緒中 (3秒)..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host "[3/3] 正在開啟預設網頁瀏覽器 (http://localhost:3000)..." -ForegroundColor Gray
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  [系統運行中] 網頁伺服器已成功開啟並監聽中！" -ForegroundColor Green
Write-Host ""
Write-Host "  【本機存取網址】:  http://localhost:3000" -ForegroundColor White

$ipList = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127*' -and $_.IPAddress -notlike '169.254*' }
foreach ($ip in $ipList) {
    Write-Host "  【區網/VPN存取】:  http://$($ip.IPAddress):3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  🔒【安全說明】:" -ForegroundColor Cyan
Write-Host "     網站開放連入供同仁手機打卡與工時算帳。若需從外勤遠端存取，" -ForegroundColor Gray
Write-Host "     建議透過 VPN 專線連入上述區網 IP，兼顧存取便利與資安防護。" -ForegroundColor Gray
Write-Host ""
Write-Host "  ★【連入監控】: 終端機與網頁視窗 (頂部「伺服器狀態」按鈕) 將即時印出連入 IP。" -ForegroundColor DarkCyan
Write-Host "  ★【自動關閉】: 使用完畢後，按下 [Enter] 鍵，將自動安全關閉 3000 伺服器。" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "請按 [Enter] 鍵以關閉伺服器並退出..."

Write-Host ""
Write-Host "[結束中] 正在關閉 Vite 網頁伺服器..." -ForegroundColor DarkYellow
$finalPort = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($finalPort) {
    Stop-Process -Id $finalPort.OwningProcess -Force -ErrorAction SilentlyContinue
}
if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "[完成] 伺服器已成功關閉。" -ForegroundColor Green
Start-Sleep -Seconds 2
