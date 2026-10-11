#!/usr/bin/env bash
# Idempotent setup: dependencies, render browser, Python ElevenLabs SDK, .env stub.
set -euo pipefail
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund
npx --no-install hyperframes browser ensure >/dev/null
python3 -c "import elevenlabs" 2>/dev/null || pip install --quiet elevenlabs || echo "warn: pip install elevenlabs failed (only needed for HyperFrames TTS)" >&2
[ -f .env ] || cp .env.example .env
