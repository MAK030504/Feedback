# Load backend/.env and push production secrets to Fly.io
# Usage:  cd backend; .\scripts\set-fly-secrets.ps1

$ErrorActionPreference = "Stop"
$envFile = Join-Path (Join-Path $PSScriptRoot "..") ".env"

if (-not (Test-Path $envFile)) {
  Write-Error "Missing $envFile"
}

$vars = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#') { return }
  if ($_ -match '^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$') {
    $vars[$matches[1]] = $matches[2]
  }
}

foreach ($required in @("DATABASE_URL", "DIRECT_URL")) {
  if (-not $vars[$required] -or $vars[$required] -match "ep-xxxx|USER:PASSWORD") {
    Write-Error "$required in .env is missing or still a placeholder. Paste your real Neon URLs first."
  }
}

$jwt = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$ipSalt = node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
$adminPass = node -e "console.log(require('crypto').randomBytes(18).toString('base64url'))"
$cors = $vars["CORS_ORIGIN"]
if (-not $cors) { $cors = "http://localhost:5173" }

$fly = Join-Path $env:USERPROFILE ".fly\bin\flyctl.exe"
if (-not (Test-Path $fly)) { $fly = "flyctl" }

$secretArgs = @(
  "DATABASE_URL=$($vars["DATABASE_URL"])",
  "DIRECT_URL=$($vars["DIRECT_URL"])",
  "JWT_SECRET=$jwt",
  "JWT_EXPIRES_IN=12h",
  "ADMIN_USERNAME=$($vars["ADMIN_USERNAME"])",
  "ADMIN_PASSWORD=$adminPass",
  "CORS_ORIGIN=$cors",
  "IP_HASH_SALT=$ipSalt",
  "SUBMISSION_RATE_LIMIT_WINDOW_MS=900000",
  "SUBMISSION_RATE_LIMIT_MAX=8"
)

foreach ($optional in @(
  "DISCORD_WEBHOOK_URL",
  "DISCORD_MENTION_USER_IDS",
  "DISCORD_MENTION_ROLE_IDS",
  "ADMIN_NOTIFY_EMAIL",
  "ADMIN_DASHBOARD_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM"
)) {
  if ($vars[$optional]) {
    $secretArgs += "$optional=$($vars[$optional])"
  }
}

& $fly secrets set @secretArgs

$notes = @"
Fly secrets updated.
API: https://mlsa-feedback-api.fly.dev
Admin username: $($vars["ADMIN_USERNAME"])
Admin password: $adminPass
"@
$notesPath = Join-Path (Join-Path $PSScriptRoot "..") ".fly-admin-credentials.local"
$notes | Set-Content -Path $notesPath -Encoding utf8
Write-Host "Saved admin login to .fly-admin-credentials.local"
Write-Host "Run: fly deploy"
