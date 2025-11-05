# server.ps1
# 简易静态服务器，使用 .NET HttpListener 提供当前目录内容并自动打开浏览器。
# 执行方式：  powershell -ExecutionPolicy Bypass -File ./server.ps1
# 停止：在窗口中按 Ctrl+C 或关闭窗口。

Param(
  [int]$Port = 8080
)

Add-Type -AssemblyName System.Net.HttpListener
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
  Write-Host "静态服务器已启动: $prefix" -ForegroundColor Green
  # 自动打开浏览器
  Start-Process $prefix
} catch {
  Write-Host "启动失败: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

function Get-MimeType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLower()) {
    '.html' { 'text/html; charset=utf-8' }
    '.css'  { 'text/css' }
    '.js'   { 'application/javascript; charset=utf-8' }
    '.png'  { 'image/png' }
    '.jpg'  { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.gif'  { 'image/gif' }
    '.mp3'  { 'audio/mpeg' }
    default { 'application/octet-stream' }
  }
}

Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $localPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($localPath)) { $localPath = 'index.html' }
    $filePath = Join-Path $PSScriptRoot $localPath

    if (Test-Path $filePath) {
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentType = Get-MimeType $filePath
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $msg = "Not Found"
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $response.OutputStream.Write($bytes,0,$bytes.Length)
    }
    $response.Close()
  } catch {
    Write-Host "处理请求时出错: $($_.Exception.Message)" -ForegroundColor Red
  }
}

$listener.Stop()
