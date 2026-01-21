# Working with this repository (step-by-step)

This README is written for collaborators who are new to Git and GitHub. Follow the sections in order. Commands below are for PowerShell on Windows; they also work in other shells with minimal changes.

**Prerequisites**
- Create a GitHub account at https://github.com if you don't have one.
- Install Git for Windows: https://git-scm.com/download/win
- Optional but recommended: install GitHub Desktop (GUI) or GitHub CLI (`gh`).

**1) Configure Git (one-time on your machine)**
- Open PowerShell and run:
-add it just for test
```
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf true
git config --global credential.helper manager-core
```

**2) Choose HTTPS or SSH (recommend SSH once set up)**
- HTTPS: easier to start, prompts username/password (or token). Good if you don't want to manage SSH keys.
- SSH: more convenient long-term (no passwords on each push). If you want SSH, generate a key and add it to GitHub (steps below).

Generate SSH key (if using SSH):

```
ssh-keygen -t ed25519 -C "your.email@example.com"
# Press Enter to accept default file locations and optionally set a passphrase
type $env:USERPROFILE"\.ssh\id_ed25519.pub" | clip
# Then paste the copied key into GitHub Profile → Settings → SSH and GPG keys → New SSH key
```

**3) Clone the repository (first time only)**
- HTTPS example:
```
git clone https://github.com/Shady-Akhrass/rasras-plastic.git
```
- SSH example:
```
git clone git@github.com:Shady-Akhrass/rasras-plastic.git
```
- Change into the project folder:
```
cd rasras-plastic
```

**4) Daily workflow — keep `main` updated**
- Fetch and update `main` before starting work:
```
git fetch origin
git switch main
git pull origin main
```

**5) Create a feature branch (always work on branches, not `main`)**
- Create and switch to a new branch:
```
git switch -c feature/short-description
```
- Example branch name: `feature/login-form`, `fix/fix-header`, `chore/update-deps`.

**6) Make changes, stage, commit**
- Stage changed files:
```
git add .
```
- Commit with a clear message:
```
git commit -m "feat(auth): add login screen and validation"
```

**7) Keep your branch up-to-date with `main` (recommended before pushing or opening PR)**
Option A — Rebase (clean history):
```
git fetch origin
git switch feature/your-branch
git rebase origin/main
```
Resolve conflicts if they appear (see section below). After a successful rebase, push:
```
git push -u origin feature/your-branch
```
If the remote branch exists and you've rewritten history with rebase, you may need to force-push safely:
```
git push --force-with-lease
```

Option B — Merge (safer for beginners):
```
git fetch origin
git switch feature/your-branch
git merge origin/main
git push -u origin feature/your-branch
```

**8) Open a Pull Request (PR)**
- Go to the repository page on GitHub.
- Click `Compare & pull request` for your branch or `New pull request` and choose your branch into `main`.
- In the PR description include:
  - What changed and why
  - How to test the changes (commands, env vars, steps)
  - Any screenshots or logs if relevant
- Request review from your teammate, wait for approvals, address review comments, then merge via the GitHub UI.

**9) After merging PR**
- Update local `main`:
```
git switch main
git pull origin main
```
- Delete your branch locally and remotely (optional cleanup):
```
git branch -d feature/your-branch
git push origin --delete feature/your-branch
```

**10) Resolving conflicts (step-by-step)**
- If a merge or rebase reports conflicts, Git will pause and mark conflicted files with markers:
```
<<<<<<< HEAD
your local code
=======
incoming remote code
>>>>>>> branch or commit
```
- Open each conflicted file in an editor and decide which code to keep. Remove the conflict markers and save.
- Stage the resolved files:
```
git add path/to/resolved-file
```
- Continue rebase or finish merge:
```
git rebase --continue   # if you were rebasing
git commit              # if you were merging and Git didn't auto-commit
```
- If you want to abort the operation and return to the previous state:
```
git rebase --abort
git merge --abort
```

**11) Common problems & fixes**
- "remote: Repository not found" — Make sure the repository URL is correct and you have access. If it is private, invite your GitHub user as a collaborator.
- "permission denied (publickey)" — You're using SSH and GitHub doesn't have your SSH key; add your public key to GitHub.
- "Updates were rejected because the remote contains work that you do not have locally" — run `git pull --rebase origin main` on your `main`, or follow the rebase/merge steps on your branch.
- Authentication with HTTPS requiring token: GitHub no longer accepts password authentication; use a Personal Access Token if prompted, or set up the credential manager.

**12) Undo mistakes (safety nets)**
- See recent actions and commits:
```
git status
git log --oneline --graph -n 20
git reflog
```
- Reset to a previous commit (destructive):
```
git reset --hard <commit-hash>
```
- If you accidentally deleted a branch, recover from reflog:
```
git reflog
git checkout -b restore-branch <commit-hash-from-reflog>

# rasras-plastic

that make sense 