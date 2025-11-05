# start.ps1
# 作用：直接在默认浏览器中打开 index.html，实现“自动运行网页”
# 使用方式：在资源管理器中双击，或在 PowerShell 中执行:  ./start.ps1
# 如果默认浏览器未关联，可显式调用 Start-Process msedge / chrome / firefox 等。

$index = Join-Path $PSScriptRoot 'index.html'
if (!(Test-Path $index)) {
  Write-Host "未找到 index.html 文件: $index" -ForegroundColor Red
  exit 1
}
Write-Host "正在打开 $index ..." -ForegroundColor Cyan
Start-Process $index
