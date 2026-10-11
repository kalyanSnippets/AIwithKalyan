#!/usr/bin/env bash
# Cloud sessions start from a fresh container: install everything the pipeline needs.
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
exec "$CLAUDE_PROJECT_DIR/scripts/setup.sh"
