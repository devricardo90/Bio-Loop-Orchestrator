$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$doneDir = Join-Path $root "docs\ops\done"
$backlog = Join-Path $root "docs\ops\BACKLOG.md"

if (!(Test-Path $doneDir)) {
  New-Item -ItemType Directory -Path $doneDir | Out-Null
}

$toastEnabled = $false
try {
  Import-Module BurntToast -ErrorAction Stop
  $toastEnabled = $true
} catch {
  $toastEnabled = $false
}

function Send-DoneToast([string]$title, [string]$body) {
  if (-not $toastEnabled) { return }
  try { New-BurntToastNotification -Text $title, $body | Out-Null } catch {}
}

Write-Host "Watching DONE signals..."
Write-Host " - $doneDir\*.done.md"
Write-Host " - $backlog"
Write-Host ""

$script:lastToastByFile = @{}
$script:debounceSeconds = 4

function ShouldToast([string]$filePath) {
  $now = Get-Date
  if ($script:lastToastByFile.ContainsKey($filePath)) {
    $delta = ($now - $script:lastToastByFile[$filePath]).TotalSeconds
    if ($delta -lt $script:debounceSeconds) { return $false }
  }
  $script:lastToastByFile[$filePath] = $now
  return $true
}

$fsw = New-Object System.IO.FileSystemWatcher
$fsw.Path = $doneDir
$fsw.Filter = "*.done.md"
$fsw.IncludeSubdirectories = $false
$fsw.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite'
$fsw.EnableRaisingEvents = $true

$onDone = {
  $path = $Event.SourceEventArgs.FullPath
  $name = [System.IO.Path]::GetFileName($path)

  if (-not (ShouldToast $path)) { return }

  Write-Host ""
  Write-Host "DONE signal: $name"
  Write-Host "Path: $path"
  Write-Host "Aguarde aprovacao explicita antes da proxima task."
  Write-Host ""

  Send-DoneToast "Task concluida" "$name - abra o relatorio e aprove a proxima etapa."
}

Register-ObjectEvent -InputObject $fsw -EventName Created -Action $onDone | Out-Null
Register-ObjectEvent -InputObject $fsw -EventName Changed -Action $onDone | Out-Null

if (Test-Path $backlog) {
  $fsw2 = New-Object System.IO.FileSystemWatcher
  $fsw2.Path = Split-Path $backlog
  $fsw2.Filter = "BACKLOG.md"
  $fsw2.NotifyFilter = [System.IO.NotifyFilters]'LastWrite'
  $fsw2.EnableRaisingEvents = $true

  Register-ObjectEvent -InputObject $fsw2 -EventName Changed -Action {
    Write-Host ""
    Write-Host "BACKLOG.md updated."
    Send-DoneToast "BACKLOG atualizado" "BACKLOG.md mudou - verifique a fila."
    Write-Host ""
  } | Out-Null
}

while ($true) { Start-Sleep -Seconds 1 }
