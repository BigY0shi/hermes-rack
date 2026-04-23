#!/bin/bash
# git-checkpoint.sh — Mandatory auto-save for Hermes project repos
# Usage: git-checkpoint.sh <message>
# If no message provided, generates from diff stats
#
# TRIGGER RULES (mandatory, not suggestions):
#   T1. After writing/modifying ANY project file
#   T2. After creating a new project directory
#   T3. After installing packages or changing dependencies
#   T4. After test runs that modify state
#   T5. After 10+ tool calls in a single session turn
#   T6. Before destructive operations (rm, reset --hard, DROP, etc.)

set -e

MESSAGE="${1:-}"
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

  # T1 checkpoint: after file modifications
  git add -A 2>/dev/null

  if git diff --cached --quiet 2>/dev/null; then
    echo "[OK] $repo — nothing to commit"
    ((SKIPPED++))
    continue
  fi

  # Generate specific commit message from diff if not provided
  if [ -z "$MESSAGE" ]; then
    STATS=$(git diff --cached --stat | tail -1)
    FILES_CHANGED=$(git diff --cached --name-only | wc -l)
    MESSAGE="checkpoint: ${FILES_CHANGED} files — ${STATS##*changed*}"
  fi

  echo "[COMMIT] $repo"
  git diff --cached --stat | head -10
  echo "commit message: $MESSAGE"
  echo "..."

  if git commit -m "$MESSAGE" 2>&1; then
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
  if ! git diff --name-only HEAD phone-api 2>/dev/null | grep -q .; then
    : # submodule unchanged
  else
    git add phone-api
    git commit -m "update phone-api submodule ref" 2>/dev/null || true
    git push 2>/dev/null || true
  fi
fi

echo ""
echo "=== Checkpoint Complete ==="
echo "  Pushed: $PUSHED | Skipped: $SKIPPED | Failed: $FAILED"
echo "  Message: $MESSAGE"
exit $FAILED