param(
  [Parameter(Mandatory = $true)]
  [string]$Command
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"
$envExamplePath = Join-Path $root ".env.example"

if (!(Test-Path $envPath) -and (Test-Path $envExamplePath)) {
  Copy-Item $envExamplePath $envPath
}

function Import-EnvFile([string]$path) {
  if (!(Test-Path $path)) {
    return
  }

  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line)) { return }
    if ($line.StartsWith("#")) { return }

    $separatorIndex = $line.IndexOf("=")
    if ($separatorIndex -lt 1) { return }

    $name = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1)

    if ($value.StartsWith('"') -and $value.EndsWith('"') -and $value.Length -ge 2) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if ($value.StartsWith("'") -and $value.EndsWith("'") -and $value.Length -ge 2) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    Set-Item -Path "Env:$name" -Value $value
  }
}

$envFiles = @(
  (Join-Path $root ".env.example")
  (Join-Path $root ".env")
  (Join-Path $root ".env.local")
  (Join-Path $root "apps\api\.env")
  (Join-Path $root "apps\web\.env.local")
)

foreach ($envFile in $envFiles) {
  Import-EnvFile $envFile
}

Invoke-Expression $Command
