param(
  [string]$Command
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"
$envExamplePath = Join-Path $root ".env.example"

if (!(Test-Path $envPath) -and (Test-Path $envExamplePath)) {
  Copy-Item $envExamplePath $envPath
  Write-Host "Created .env from .env.example"
}

if ($Command) {
  Invoke-Expression $Command
}
