# Truth audit: our steps vs the reference (Outskill)

✅ = shown on camera and true · ⚠️ = differs from the reference, or needs careful wording · ❌ = not shown / was wrong (fixed in the script)

## Method 1: Ollama
| Reference step | Ours | Status |
|---|---|---|
| Install Ollama (Windows installer) | `142752` 0:00–1:35 | ✅ |
| Apps / Chat / Settings, Cloud off | `142752` 3:04–4:15 | ✅ |
| Context length → 64K | Slider dragged to 64K at ~5:30 | ✅ |
| Warm up with Qwen 3.5 4B, "hi" | `qwen3.5:4b`, "hi" 6:20–7:23 | ✅ |
| Wi-Fi off → offline calculator app | Wi-Fi switched off 7:28–7:40; calculator answered offline (7:56, 18 s); then notes app (8:52) | ✅ (we show the notes app) |
| Wi-Fi back on → online compiler, it runs | OneCompiler 11:37–12:41 (JS error → HTML → works). Turning Wi-Fi back on isn't shown | ⚠️ say it, don't claim it's shown |
| Check hardware in Task Manager | Ryzen 5 7535U, **integrated** Radeon: 484 MB dedicated + 7.7 GB shared, 16 GB RAM | ❌ was "8 GB VRAM": fixed |
| Ask ChatGPT, then a follow-up "is this still the latest?" | One prompt that already asks for the latest model; answer MiMo-V2.6-Distill-Qwen-9B | ❌ "follow-up" claim removed |
| Model not in dropdown → Antigravity installs it | Plus an "Ollama too old" error before it | ✅ |
| Apps → Claude Code → terminal → Claude Code runs locally → calculator → iterate | Only "launch command copied" + folder/terminal shown | ❌ not recorded → one-command graphic; never claim it ran |

## Method 2: OpenRouter
| Reference step | Ours | Status |
|---|---|---|
| Sign up, key, 7-day expiry, spending limit | `154411` 1:30–2:10 | ✅ |
| Models → price filter: free | B-roll captured 2026-11-10 (claude-recorded) | ✅ (B-roll, not his screen) |
| Settings block with Opus/Sonnet/Haiku seats → free | His block maps all three seats to `openrouter/free` | ✅ |
| Opens on OpenRouter; `/status` shows openrouter | Banner "openrouter/free · API Usage Billing". No `/status` | ✅ (we don't claim `/status`) |
| (extra) First paste failed → paid Claude Pro login | `121640` 1:12–3:40 | ✅ true, and a strong extra |
| `/model` seats; "which model" | `123051` 4:36–5:31 | ✅ |
| Activity log: real model, $0 | 3 requests · 24.6K tokens · $0.00 | ✅ |
| `/usage` estimate isn't the bill | $0.1348 "may be inaccurate" | ✅ |
| 20/min, 50/day caps; 429 mid-task | Never hit on camera | ⚠️ graphic only; say "about 50/day on a new account" |

## Method 3: OmniRoute
| Reference step | Ours | Status |
|---|---|---|
| Antigravity installs OmniRoute, dashboard, CHANGEME | `154801` | ✅ |
| Kiro: sign in, real Claude models, 50 credits/month, ToS warning | Connected (`113521` 0:10–1:15). "Subscription Required" tab seen. Credit amount not shown | ⚠️ "small free allowance", not "50 credits" |
| NVIDIA: key, priority 1, "40 req/min" | Key created; check failed: certificate error on his network | ⚠️ honest "expect errors"; limit not verified, don't quote "40/min" |
| OpenRouter key in OmniRoute | Not recorded on his laptop (sandbox only) | ⚠️ don't show / say generically |
| Cline, Antigravity sign-ins | Cline sign-in `154411` 3:08; Antigravity connected `113521` 1:40–3:45 | ✅ |
| Combo: GPT-OSS on NVIDIA + OpenRouter backup, intelligent auto | His "Claude" combo: Gemini, Kiro Sonnet 4.5, Kimi/Qwen/DeepSeek (via "if/"), NVIDIA Llama, Groq; Rules scoring | ⚠️ the "if/" and Groq connections were never shown, so don't name them as connected/free |
| OmniRoute API key | `154411` 11:32 | ✅ |
| Shortcuts prompt (key into a file, not the chat) | Shortcuts created + desktop icons (`160207`) | ✅ (we don't claim the key-file part) |
| "Free models only" prompt | Done on the **test machine** (CR-01), not shown on his laptop | ⚠️ label "test machine" |
| Double-click → hi → "which model" → logs show Kiro Claude Sonnet | `121406`: 503 first ("Kiro circuit breaker open"), retry → logs: claude-sonnet-4.5 · KIRO · Claude · 200 | ✅ |
| Real test: note-taking app, asks 3 questions → plan → working app on localhost | Test machine: plan mode asks 3 questions → plan → build; Claude → NVIDIA fallback is real; **the app didn't work until fix rounds + a cleanup by Claude (this session)** | ⚠️ say "test machine" + "it needed fixes" |

## Wording fixed in `free-claude-code.script.md`
1.4 hardware + ChatGPT; 1.6 Ollama launch; 2.5 caps; 3.2 Kiro + NVIDIA limits; 3.3 combo backups; 3.4 /model on the test machine;
3.5 503 cause; 3.6 notes app (test machine, needed fixes). Rough-cut labels updated to match (rebuild with `edits/free-claude-code.roughcut.py`).
