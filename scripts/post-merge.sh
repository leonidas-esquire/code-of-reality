#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

# Automatically push every merged commit to GitHub.
#
# Trigger: this script runs via Replit's [postMerge] hook, which fires after
# each task is merged into the main app. That is the canonical commit point in
# Replit's multi-agent workflow, so every code change that reaches the main
# branch here will be mirrored to GitHub.
#
# Requires the GITHUB_PAT secret to be set in Replit Secrets with 'repo' scope.

if [ -z "$GITHUB_PAT" ]; then
  echo "GITHUB_PAT is not set — skipping GitHub push. Add the secret in Replit Secrets to enable automatic sync."
  exit 0
fi

echo "Pushing to GitHub..."

git config user.email "replit-sync@users.noreply.github.com"
git config user.name "Replit Sync"

# Add the remote transiently so the token never persists in git config.
git remote remove github 2>/dev/null || true
git remote add github "https://${GITHUB_PAT}@github.com/leonidas-esquire/code-of-reality.git"

# Use a standard (non-force) push. Replit is the single source of truth for
# this repository; if the push fails due to divergence it means the GitHub
# remote received commits outside this sync path — resolve by rebasing
# GitHub's commits onto the Replit branch before the next merge.
if git push github HEAD:main; then
  echo "Successfully synced to GitHub."
else
  echo "ERROR: GitHub push failed. The remote may have diverged. Check github.com/leonidas-esquire/code-of-reality and ensure no commits were pushed directly to GitHub outside of Replit." >&2
  git remote remove github
  exit 1
fi

git remote remove github
