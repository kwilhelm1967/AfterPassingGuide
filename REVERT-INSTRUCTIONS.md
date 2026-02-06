# Revert to Earlier State

## Option 1: Double-click the script (recommended)

**To revert to last week:**
1. Double-click **`revert-to-last-week.bat`** in the project folder.

**To revert to 3 days ago:**
1. Double-click **`revert-to-3-days-ago.bat`** in the project folder.
2. It will:
   - Create a backup branch `backup-before-revert` (your current state).
   - Find the most recent commit from last week (or 3 days ago for the other script).
   - Ask you to type **YES** to confirm.
   - Reset the repo to that commit (all changes since then are removed).
3. To **undo the revert** and return to today’s state:
   ```bat
   git reset --hard backup-before-revert
   ```

## Option 2: Use Command Prompt

1. Open **Command Prompt** (Win+R → `cmd` → Enter).
2. Go to the project folder:
   ```bat
   cd /d "C:\Users\Kelly's Laptop\OneDrive\Desktop\Vault-Main\LegacyAftercareAssistant"
   ```
3. Create a backup (optional but recommended):
   ```bat
   git branch backup-before-revert
   ```
4. See recent commits and dates:
   ```bat
   git log --oneline -20
   ```
5. Pick the commit hash you want (e.g. the one from ~3 days ago), then:
   ```bat
   git reset --hard <commit-hash>
   ```
   Example: `git reset --hard a1b2c3d`

## Option 3: Revert without losing history

If you prefer to **add a new commit** that undoes recent changes (keeps history):

```bat
git log --oneline -10
```
Find the commit from 3 days ago, then:

```bat
git revert --no-commit <newest-commit>..HEAD
git commit -m "Revert to state from 3 days ago"
```

This creates a new commit that cancels out everything after the chosen point.

---

**Warning:** `git reset --hard` removes uncommitted changes and moves the branch back. Anything not on the backup branch or not pushed can’t be recovered. Use the backup branch if you might want to return to the current state.
