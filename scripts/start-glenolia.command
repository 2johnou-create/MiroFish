#!/bin/sh
cd "$(dirname "$0")/.." || exit 1
GLENOLIA_NODE=$(command -v node 2>/dev/null)
if [ -z "$GLENOLIA_NODE" ]; then
  GLENOLIA_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [ ! -x "$GLENOLIA_NODE" ]; then
  echo "Install a Node.js version supported by the frontend, then run node scripts/glenolia.mjs preflight."
  exit 1
fi
exec "$GLENOLIA_NODE" scripts/glenolia.mjs start
