#!/bin/bash
# Validates that .replit contains the expected [postMerge] hook configuration.
# Run this to guard against accidental removal of the auto-sync wiring.
set -e

REPLIT_FILE=".replit"
EXPECTED_PATH="scripts/post-merge.sh"

if [ ! -f "$REPLIT_FILE" ]; then
  echo "ERROR: $REPLIT_FILE not found." >&2
  exit 1
fi

if ! grep -q '^\[postMerge\]' "$REPLIT_FILE"; then
  echo "ERROR: [postMerge] section is missing from $REPLIT_FILE." >&2
  exit 1
fi

if ! grep -q "path = \"$EXPECTED_PATH\"" "$REPLIT_FILE"; then
  echo "ERROR: postMerge path is not set to \"$EXPECTED_PATH\" in $REPLIT_FILE." >&2
  exit 1
fi

if [ ! -f "$EXPECTED_PATH" ]; then
  echo "ERROR: Post-merge script '$EXPECTED_PATH' does not exist." >&2
  exit 1
fi

if [ ! -x "$EXPECTED_PATH" ]; then
  echo "ERROR: Post-merge script '$EXPECTED_PATH' is not executable." >&2
  exit 1
fi

echo "OK: [postMerge] hook is correctly wired to $EXPECTED_PATH."
