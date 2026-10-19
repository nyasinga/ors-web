<#
.SYNOPSIS
  Serve the ors-web production build on a Windows VM.

.DESCRIPTION
  Serves the Vite "dist" folder with SPA fallback (client-side routing).
  Requires Node.js 18+ (https://nodejs.org).

.PARAMETER DistPath
  Path to the built site (folder that contains index.html). Default: .\dist

.PARAMETER Port
  HTTP port. Default: 8080

.PARAMETER HostAddress
  Bind address. Use 0.0.0.0 so other machines can reach this VM. Default: 0.0.0.0

.EXAMPLE
  .\serve-ors-web.ps1
  .\serve-ors-web.ps1 -DistPath "C:\apps\ors-web" -Port 80
#>

[CmdletBinding()]
param(
  [string]$DistPath = "",
  [int]$Port = 8080,
  [string]$HostAddress = "0.0.0.0"
)

$ErrorActionPreference = "Stop"

function Resolve-DistPath {
  param([string]$Path)

  if ($Path -and (Test-Path -LiteralPath $Path)) {
    return (Resolve-Path -LiteralPath $Path).Path
  }

  $candidates = @(
    (Join-Path $PSScriptRoot "dist"),
    (Join-Path $PSScriptRoot "..\..\dist"),
    (Join-Path (Get-Location) "dist"),
    (Join-Path (Get-Location) "ors-web")
  )

  foreach ($candidate in $candidates) {
    $index = Join-Path $candidate "index.html"
    if (Test-Path -LiteralPath $index) {
      return (Resolve-Path -LiteralPath $candidate).Path
    }
  }

  throw @"
Could not find dist\index.html.

Copy the production build onto this VM first, then run:
  .\serve-ors-web.ps1 -DistPath "C:\path\to\dist"

Or extract ors-web-dist.tar.gz into a folder and pass that folder as -DistPath.
"@
}

Write-Host ""
Write-Host "=== ORS Web — Windows static server ===" -ForegroundColor Cyan

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  throw "Node.js was not found on PATH. Install Node.js LTS from https://nodejs.org and reopen PowerShell."
}

$nodeVersion = (& node -v).Trim()
Write-Host "Node: $nodeVersion"

$siteRoot = Resolve-DistPath -Path $DistPath
$indexPath = Join-Path $siteRoot "index.html"
if (-not (Test-Path -LiteralPath $indexPath)) {
  throw "Missing index.html in $siteRoot"
}

Write-Host "Site: $siteRoot"
Write-Host "URL:  http://${HostAddress}:${Port}  (from this VM also try http://localhost:${Port})"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

# serve -s enables SPA fallback to index.html
$serveArgs = @(
  "--yes",
  "serve@14",
  "-s", $siteRoot,
  "-l", "tcp://${HostAddress}:${Port}"
)

& npx @serveArgs
if ($LASTEXITCODE -ne 0) {
  throw "Failed to start server (exit $LASTEXITCODE)."
}
