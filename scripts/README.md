# Scripts folder

This folder contains simple PowerShell helper scripts to update your local copy and push changes to GitHub. They're designed for Windows PowerShell and assume `git` is installed and available in PATH.

Files:
- `update-local.ps1` — update local `main` from `origin/main`.
- `create-branch-and-push.ps1` — create a feature branch, commit staged changes (or all), rebase, and push the branch.
- `push-main.ps1` — commit changes and push to `main` (with pull/rebase before push).
- `remove-personal-cache.ps1` — stop tracking `personal/` if it was tracked before.

Usage examples (PowerShell):

```
# Update your local main
.\scripts\update-local.ps1

# Create a branch, commit and push
.\scripts\create-branch-and-push.ps1

# Commit and push to main
.\scripts\push-main.ps1

# Stop tracking personal/ if needed
.\scripts\remove-personal-cache.ps1
```

Be careful: scripts will run `git` commands and may modify your working tree. Read the script before running.
