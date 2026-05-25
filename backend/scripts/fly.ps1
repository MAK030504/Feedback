# Fly.io CLI wrapper — works when `fly` is not on PATH yet.
# Usage (from backend/):  .\scripts\fly.ps1 auth login
#                        .\scripts\fly.ps1 deploy

$Fly = Join-Path $env:USERPROFILE ".fly\bin\flyctl.exe"

if (-not (Test-Path $Fly)) {
  Write-Error @"
flyctl not found at $Fly
Install: irm https://fly.io/install.ps1 | iex
Then restart Cursor (or run: `$env:Path += ';$env:USERPROFILE\.fly\bin')
"@
  exit 1
}

& $Fly @args
