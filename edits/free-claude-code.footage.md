# Free Claude Code: footage map

Kalyan's recordings: Drive "Screen Recordings" → `media/screen-recordings/free-claude-code/`.
Claude-recorded clips (Linux sandbox, 1920×1080, silent) → `media/screen-recordings/claude-recorded/`.

## Method 1: Ollama (Kalyan)
- `2026-11-05_142752`: install Ollama, Apps / Settings, chat `hi`. **Wi-Fi switched off at 7:28–7:40**, then offline prompts:
  calculator (7:56, answer cut off) and **notes app (8:52)**; the code is run in OneCompiler at 12:28.
- `2026-11-05_145317`: Task Manager (8 GB VRAM / 16 GB RAM), ChatGPT model pick, Ollama update error, Antigravity installs mimo.
- `2026-11-06_121640` 0:09–0:30: Apps → Claude Code → "Launch command copied". **No Claude Code + Ollama run was recorded**:
  cover it with this clip plus a graphic of the one command, and don't claim it ran.

## Method 2: OpenRouter (Kalyan)
- `2026-11-06_121640` 1:12–3:40: first paste fails → Claude Code opens on the paid Claude Pro login (the trap).
- `2026-11-06_123051`: env vars line by line, `openrouter/free`, `/model`, "which model are you?", Activity $0.00, `/usage` estimate.

## Method 3: OmniRoute
- `2026-11-06_154801` (Kalyan): GitHub repo, Antigravity install prompt, summary, sign-in, Providers.
- `2026-11-07_163037` (Kalyan): NVIDIA sign-up.
- `2026-11-10_113521` (Kalyan): Kiro device login → connected (0:00–1:10); Antigravity Google sign-in → connected (1:40–3:45);
  NVIDIA key "Invalid · fetch failed" (5:20), test message shows `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` (7:50), so the laptop's
  network intercepts TLS. G4F page at 5:40: leave it out.
- `2026-11-10_114247` (Kalyan): `omniroute` started in PowerShell; "Claude" combo edited: Antigravity Gemini, Kiro Claude Sonnet 4.5,
  Kimi, Qwen, DeepSeek, NVIDIA Llama, Groq; Ship Fast + Rules scoring (1:00–3:20); Intelligent Routing dashboard.
- `2026-11-10_121406` (Kalyan): **desktop double-click "Free Claude Code"** → Claude Code → "what model are you?" → 503 Kiro
  circuit breaker → asks again → answers "Claude" → `/status`, `/usage` $0.1283 (an estimate) → Logs: **claude-sonnet-4.5 · KIRO ·
  combo Claude · 200** (2:56). This is the receipt.
- Claude-recorded:
  - `01-launcher-model-hi`: launcher auto-starts OmniRoute, `/model` shows free models only, "hi" in 3 s, the model wrongly calls
    itself "Claude Fable 5" (the log says Kiro Claude Sonnet 4.5).
  - `02-dashboard-combos-logs`: combos and logs pages.
  - `04-planmode-questions-build` (9 min, speed it up): "Design me a simple personal note-taking application." in plan mode → asks
    Tech stack / Features / Storage → plan → builds a React + Vite app. Logs: Claude Sonnet 4.6 via Antigravity for 31 requests,
    429 limit, then free NVIDIA Nemotron took over (~130 requests).
  - `05-fix-round1`, `06-fix-round2-unfinished`: free-model fix attempts. The first worked; the second went in circles.
  - `07-notes-app-working` (45 s): the finished app on localhost: new notes, tags, Markdown split preview, tag filter,
    search, refresh → notes still there.
  - Honesty note: the free-model build had several bugs; Claude (in this session) fixed and restyled the app off camera
    before clip 07. Say "it took a few fix rounds", not "it worked first time".
