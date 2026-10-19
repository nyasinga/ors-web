<#
.SYNOPSIS
  Install ors-web as a Windows service using NSSM (optional).

.DESCRIPTION
  1. Install NSSM: https://nssm.cc/download  (or winget install nssm)
  2. Ensure Node.js is installed
  3. Run this script as Administrator

.EXAMPLE
  .\install-as-service.ps1 -DistPath "C:\apps\ors-web" -Port 8080
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$DistPath,

  [int]$Port = 8080,

  [string]$ServiceName = "ORSWeb",

  [string]$HostAddress = "0.0.0.0"
)

$ErrorActionPreference = "Stop"

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
  ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Run this script as Administrator."
}

$nssm = Get-Command nssm -ErrorAction SilentlyContinue
if (-not $nssm) {
  throw "NSSM not found. Install with: winget install nssm   or download from https://nssm.cc/download"
}

$node = (Get-Command node).Source
$npx = (Get-Command npx).Source
$siteRoot = (Resolve-Path -LiteralPath $DistPath).Path
$indexPath = Join-Path $siteRoot "index.html"
if (-not (Test-Path -LiteralPath $indexPath)) {
  throw "Missing index.html in $siteRoot"
}

$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Stopping and removing existing service $ServiceName..."
  & nssm stop $ServiceName
  & nssm remove $ServiceName confirm
}

Write-Host "Installing service $ServiceName..."
& nssm install $ServiceName $npx
& nssm set $ServiceName AppParameters "serve@14 -s `"$siteRoot`" -l tcp://${HostAddress}:${Port}"
& nssm set $ServiceName AppDirectory $siteRoot
& nssm set $ServiceName DisplayName "ORS Web Frontend"
& nssm set $ServiceName Description "Static host for the ACA ORS web app (SPA)"
& nssm set $ServiceName Start SERVICE_AUTO_START
& nssm set $ServiceName AppStdout (Join-Path $siteRoot "ors-web-service.out.log")
& nssm set $ServiceName AppStderr (Join-Path $siteRoot "ors-web-service.err.log")
& nssm set $ServiceName AppRotateFiles 1

& nssm start $ServiceName
Write-Host ""
Write-Host "Service started: $ServiceName"
Write-Host "Open: http://localhost:${Port}"
Write-Host "Manage: nssm edit $ServiceName   |   nssm stop $ServiceName"
