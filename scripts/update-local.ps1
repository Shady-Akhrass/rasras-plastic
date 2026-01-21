#!/usr/bin/env pwsh
Write-Host "Updating local 'main' from 'origin/main'..."

git fetch origin
git switch main
# Rebase local main onto origin/main to keep history linear
git pull --rebase origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Local 'main' updated successfully." -ForegroundColor Green
} else {
    Write-Host "There was a problem updating local 'main'. Check git output above." -ForegroundColor Red
}
