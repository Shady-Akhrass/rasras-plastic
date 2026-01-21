#!/usr/bin/env pwsh
Write-Host "Stopping tracking of personal/ folder (if it was previously tracked)..."

if (-not (Test-Path -Path "personal")) {
    Write-Host "personal/ folder does not exist. Nothing to do." -ForegroundColor Yellow
    exit 0
}

git rm -r --cached personal
git commit -m "chore: stop tracking personal/ folder"
git push

if ($LASTEXITCODE -eq 0) { Write-Host "personal/ is no longer tracked and change pushed." -ForegroundColor Green }
