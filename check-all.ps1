$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host '== Web app: build ==' -ForegroundColor Cyan
Push-Location (Join-Path $Root 'web-app')
npm run build

Write-Host '== Web app: lint ==' -ForegroundColor Cyan
npm run lint
Pop-Location

Write-Host '== Python modeling: pytest ==' -ForegroundColor Cyan
Push-Location (Join-Path $Root 'modeling')
python -m pytest
Pop-Location

Write-Host 'All checks passed.' -ForegroundColor Green
