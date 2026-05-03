#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

# Automatically keep Replit and GitHub in sync after every merge.
#
# Trigger: this script runs via Replit's [postMerge] hook, which fires after
# each task is merged into the main app. That is the canonical commit point in
# Replit's multi-agent workflow, so every code change that reaches the main
# branch here will be mirrored to GitHub.
#
# Sync strategy (GitHub → Replit → GitHub):
#   1. Fetch the GitHub main branch.
#   2. If GitHub has commits that Replit does not, rebase Replit on top of them
#      so local history incorporates any direct GitHub changes (e.g. branch-
#      protection updates, GitHub Actions, manual edits).
#   3. Push the resulting branch back to GitHub.
#
# Requires the GITHUB_PAT secret to be set in Replit Secrets with 'repo' scope.

if [ -z "$GITHUB_PAT" ]; then
  echo "GITHUB_PAT is not set — skipping GitHub sync. Add the secret in Replit Secrets to enable automatic sync."
  exit 0
fi

git config user.email "replit-sync@users.noreply.github.com"
git config user.name "Replit Sync"

# Add the remote transiently so the token never persists in git config.
git remote remove github 2>/dev/null || true
git remote add github "https://${GITHUB_PAT}@github.com/leonidas-esquire/code-of-reality.git"

# ── Step 1: Pull GitHub → Replit ──────────────────────────────────────────────
echo "Fetching latest commits from GitHub..."
if ! git fetch github main 2>&1; then
  echo "WARNING: Could not fetch from GitHub — skipping sync." >&2
  git remote remove github 2>/dev/null || true
  exit 0
fi

BEHIND=$(git rev-list --count HEAD..github/main 2>/dev/null || echo 0)

if [ "$BEHIND" -gt 0 ]; then
  echo "GitHub has $BEHIND commit(s) not present in Replit. Rebasing local branch on top of GitHub main..."
  # Rebase local commits on top of whatever GitHub has so we never lose either side.
  if git rebase github/main; then
    echo "Rebase succeeded — Replit is now up to date with GitHub."
  else
    # Non-conflicting divergence (e.g. GitHub Actions commits, branch-protection
    # rule changes) is resolved automatically by the rebase above.
    # Conflicting divergence (the same file edited incompatibly on both sides)
    # cannot be resolved without human judgement.  We abort cleanly and exit 1
    # so the failure is visible in the post-merge log rather than silently
    # swallowed.
    #
    # Recovery: inspect `git status`, resolve conflicts manually, then run
    # `git rebase --continue` and push to GitHub once the branch is clean.
    echo "ERROR: Rebase conflict detected — branches have incompatible changes that require manual resolution." >&2
    echo "  1. Run: git rebase --abort   (if not already done)" >&2
    echo "  2. Fetch GitHub: git fetch github main" >&2
    echo "  3. Resolve conflicts, then: git rebase github/main" >&2
    echo "  4. Push manually: git push github HEAD:main" >&2
    git rebase --abort 2>/dev/null || true
    git remote remove github 2>/dev/null || true
    exit 1
  fi
else
  echo "Replit is already up to date with GitHub (no new commits to pull)."
fi

# ── Step 2: Push Replit → GitHub ──────────────────────────────────────────────
echo "Pushing to GitHub..."
if git push github HEAD:main; then
  echo "Successfully synced to GitHub."
else
  echo "WARNING: GitHub push failed — branches may still have diverged. Check the repository manually." >&2
fi

git remote remove github 2>/dev/null || true
