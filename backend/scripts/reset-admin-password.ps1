# Reset admin password in Neon + Fly secret + credentials file
# Usage: cd backend; .\scripts\reset-admin-password.ps1

$ErrorActionPreference = "Stop"
$backendRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $backendRoot ".env"

if (-not (Test-Path $envFile)) {
  Write-Error "Missing $envFile"
}

$adminUser = "mlsa-admin"
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*ADMIN_USERNAME\s*=\s*"?([^"]*)"?\s*$') {
    $adminUser = $matches[1]
  }
}

$adminPass = node -e "console.log(require('crypto').randomBytes(18).toString('base64url'))"

Set-Location $backendRoot
node scripts/reset-admin-password.mjs $adminPass

$fly = Join-Path $env:USERPROFILE ".fly\bin\flyctl.exe"
if (Test-Path $fly) {
  & $fly secrets set "ADMIN_PASSWORD=$adminPass"
  Write-Host "Fly ADMIN_PASSWORD secret updated."
} else {
  Write-Warning "flyctl not found. Update ADMIN_PASSWORD on Fly manually."
}

$notesPath = Join-Path $backendRoot ".fly-admin-credentials.local"
$lines = @(
  "Fly admin credentials (reset $(Get-Date -Format 'yyyy-MM-dd HH:mm')):"
  "API: https://mlsa-feedback-api.fly.dev"
  "Login: https://feedback-rust-three.vercel.app/admin/login"
  "Admin username: $adminUser"
  "Admin password: $adminPass"
)
$lines | Set-Content -Path $notesPath -Encoding utf8

Write-Host ""
Write-Host "Login: https://feedback-rust-three.vercel.app/admin/login"
Write-Host "Username: $adminUser"
Write-Host "Password: $adminPass"
Write-Host "Saved to $notesPath"
