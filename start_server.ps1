# ArchSystems 伺服器與連入 IP 監控啟動腳本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  ArchSystems 建築師事務所三位一體整合系統 (ERP)" -ForegroundColor Yellow
Write-Host "  【伺服器啟動 · 區網連線指南 · 連入 IP 即時監控】" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. 檢查 3000 通訊埠，清理舊進程
$listeningPort = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($listeningPort) {
    Write-Host "[資訊] 偵測到舊有伺服器進程 (PID: $($listeningPort.OwningProcess))，正在清理..." -ForegroundColor DarkYellow
    Stop-Process -Id $listeningPort.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host "[1/3] 正在啟動 Vite 網頁伺服器 (Port: 3000 / Host: 0.0.0.0)..." -ForegroundColor Gray
$serverProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "vite --port 3000 --host 0.0.0.0" -PassThru -NoNewWindow

Write-Host "[2/3] 等待伺服器就緒中 (3秒)..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host "[3/3] 正在開啟本機預設網頁瀏覽器 (http://localhost:3000)..." -ForegroundColor Gray
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  🚀【系統已開啟並開放區網連線】" -ForegroundColor Green
Write-Host ""
Write-Host "  📍 1. 本機存取網址 (本台電腦使用):" -ForegroundColor White
Write-Host "        👉 http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  🌐 2. 區網 / 事務所同仁電腦與手機連入網址:" -ForegroundColor Yellow

$ipList = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike '127*' -and 
    $_.IPAddress -notlike '169.254*' -and 
    $_.InterfaceAlias -notlike '*Loopback*' 
}
foreach ($ip in $ipList) {
    Write-Host "        👉 http://$($ip.IPAddress):3000  ($($ip.InterfaceAlias))" -ForegroundColor Green
}

Write-Host ""
Write-Host "  ----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  💻【區網內其他電腦要怎麼連過來？操作三步驟】:" -ForegroundColor Cyan
Write-Host "     步驟 ① : 確保其他電腦 / 手機已連上事務所同一 Wi-Fi 或區域網路。" -ForegroundColor White
Write-Host "     步驟 ② : 在該台電腦上開啟 Chrome / Edge / Safari 瀏覽器。" -ForegroundColor White
Write-Host "     步驟 ③ : 在網址列直接輸入上述網址 (例如 http://10.21.85.168:3000) 即可開啟系統！" -ForegroundColor White
Write-Host ""
Write-Host "  🛡️【常見防火牆說明】:" -ForegroundColor Yellow
Write-Host "     若同仁連線顯示「無法連線」，請確認本台電腦的 Windows 防火牆" -ForegroundColor Gray
Write-Host "     是否有跳出「允許 Node.js / Vite 存取私人網路」並勾選允許。" -ForegroundColor Gray
Write-Host ""
Write-Host "  👁️【連入 IP 即時監控】:" -ForegroundColor Cyan
Write-Host "     同仁連入時，本終端機與網頁視窗 (頂部【🟢 伺服器狀態】) 將即時印出連入 IP。" -ForegroundColor Gray
Write-Host ""
Write-Host "  ❌【自動關閉】: 使用完畢後，按下 [Enter] 鍵即可自動關閉伺服器並退出。" -ForegroundColor Yellow
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
