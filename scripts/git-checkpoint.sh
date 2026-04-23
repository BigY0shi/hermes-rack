#!/bin/bash
# git-checkpoint.sh — Auto-save all Hermes project repos
# Usage: ~/projects/hermes-rack/scripts/git-checkpoint.sh [message]
# If no message provided, uses timestamp

set -e

MESSAGE="${1:-checkpoint: auto-save $(date +%Y%m%d-%H%M)}"
REPOS=(
  "$HOME/projects/hermes-rack"
  "$HOME/projects/hermes-rack/phone-api"
  "$HOME/projects/hermes-phone"
)

PUSHED=0
SKIPPED=0
FAILED=0

for repo in "${REPOS[@]}"; do
  if [ ! -d "$repo/.git" ]; then
    echo "[SKIP] $repo — not a git repo"
    continue
  fi

  cd "$repo"
  
  # Stage everything
  git add -A 2>/dev/null
  
  # Check if there's anything to commit
  if git diff --cached --quiet 2>/dev/null; then
    echo "[OK] $repo — nothing to commit"
    ((SKIPPED++))
    continue
  fi
  
  # Show what's being committed
  echo "[COMMIT] $repo"
  git diff --cached --stat | head -10
  echo "..."
  
  # Commit
  if git commit -m "$MESSAGE" 2>&1; then
    # Push
    if git push 2>&1; then
      echo "[PUSHED] $repo"
      ((PUSHED++))
    else
      echo "[WARN] $repo — commit OK but push failed"
      ((FAILED++))
    fi
  else
    echo "[FAIL] $repo — commit failed"
    ((FAILED++))
  fi
done

# Update submodule ref in hermes-rack if phone-api changed
if [ -d "$HOME/projects/hermes-rack/phone-api/.git" ]; then
  cd "$HOME/projects/hermes-rack"
  if git diff --name-only HEAD phone-api 2>/dev/null | grep -q .; then
    git add phone-api
    git commit -m "update phone-api submodule ref" 2>/dev/null || true
    git push 2>/dev/null || true
  fi
fi

echo ""
echo "=== Checkpoint Complete ==="
echo "Pushed: $PUSHED | Skipped: $SKIPPED | Failed: $FAILED"
echo "Message: $MESSAGE"

exit $FAILED