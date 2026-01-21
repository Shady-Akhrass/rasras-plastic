#!/usr/bin/env pwsh
param(
    [string]$CommitMessage = $(Read-Host "Commit message (short)")
)

Write-Host "Staging changes..."
git add .

if (-not $CommitMessage) {
    $CommitMessage = "chore: update by $env:USERNAME"
}

git commit -m "$CommitMessage"

Write-Host "Updating local main with remote before pushing..."
git pull --rebase origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Pull/rebase failed. Resolve conflicts then retry." -ForegroundColor Yellow
    exit 1
}

Write-Host "Pushing to origin/main..."
git push origin main

if ($LASTEXITCODE -eq 0) { Write-Host "Pushed to main." -ForegroundColor Green }
