#!/usr/bin/env bash
set -euo pipefail

# Scan tracked files for unresolved merge markers.
# Match canonical markers only at line start.

if git ls-files -z | xargs -0 rg -n "^(<<<<<<<|=======|>>>>>>>)" -- >/tmp/merge_markers.txt; then
  echo "❌ Unresolved merge markers detected:"
  cat /tmp/merge_markers.txt
  exit 1
fi

echo "✅ No unresolved merge conflict markers found."
