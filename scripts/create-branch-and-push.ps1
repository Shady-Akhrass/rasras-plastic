#!/usr/bin/env pwsh
param(
    [string]$BranchName = $(Read-Host "Branch name (e.g. feature/your-name)") ,
    [string]$CommitMessage = $(Read-Host "Commit message (short)")
)

if (-not $BranchName) {
    Write-Host "Branch name is required." -ForegroundColor Red
    exit 1
}

Write-Host "Creating and switching to branch $BranchName..."
git switch -c $BranchName

Write-Host "Staging all changes..."
git add .

if (-not $CommitMessage) {
    $CommitMessage = "chore: update by $env:USERNAME"
}

git commit -m "$CommitMessage"

Write-Host "Rebasing branch onto origin/main..."
git fetch origin
git rebase origin/main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Rebase failed. Resolve conflicts, then run 'git rebase --continue'." -ForegroundColor Yellow
    exit 1
}

Write-Host "Pushing branch to origin..."
git push -u origin $BranchName

if ($LASTEXITCODE -eq 0) { Write-Host "Branch pushed successfully." -ForegroundColor Green }
