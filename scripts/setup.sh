#!/usr/bin/env bash
# Idempotent setup: dependencies, render browser, Python ElevenLabs SDK, .env stub.
set -euo pipefail
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund
npx --no-install hyperframes browser ensure >/dev/null
python3 -c "import elevenlabs" 2>/dev/null || pip install --quiet elevenlabs || echo "warn: pip install elevenlabs failed (only needed for HyperFrames TTS)" >&2
# yt-dlp: metadata and downloads of Kalyan's own videos (uses Node for YouTube's JS player)
command -v yt-dlp >/dev/null || uv tool install --quiet yt-dlp || pip install --quiet yt-dlp || echo "warn: yt-dlp install failed" >&2
mkdir -p ~/.config/yt-dlp && [ -f ~/.config/yt-dlp/config ] || echo "--js-runtimes node" > ~/.config/yt-dlp/config
[ -f .env ] || cp .env.example .env
