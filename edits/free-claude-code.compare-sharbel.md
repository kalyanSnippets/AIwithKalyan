# Comparison: Sharbel A. "Unlimited Claude Code For Free (Runs On Your Computer)" vs our teleprompter (v3)

Reference: youtu.be/K8lVHiFnN2A · 12:16 · ~1.08M views in ~3 weeks (published 18 Oct 2026, the strongest performer in this niche right now).

## How his video is built (timeline)
| Time | Beat | Technique |
|---|---|---|
| 0:00 | "Most powerful coding agent… costs a fortune… hit your limit mid-task, it just **stops**" | **Pain hook** (cost + limits) |
| 0:15 | "Now run Claude Code completely free… not a knockoff" | Promise + objection handling |
| 0:30 | "By the end, you'll have the same Claude Code… it will cost you nothing" | **End-state promise** |
| 0:45 | Brain vs tool ("agent harness"): you pay for the brain, the tool runs on any brain | Simple mental model (like our phone/SIM) |
| 1:24 | Ollama now "speaks Claude Code's language" | Why it's possible now (timeliness) |
| 1:45 | Install Ollama (Mac terminal command) | Step |
| 2:30 | **RAM → model tiers**: 8–16 GB → Gemma 4 12B · 18–32 GB → Qwen3 Coder · 64 GB+ → GPT-OSS 120B. Mac shared memory: pick about half your RAM | Practical, personal ("find your RAM") |
| 3:51 | **Free list in the first link** + newsletter plug | **Lead magnet** |
| 4:25 | Ollama Apps → Claude Code desktop app **or** `ollama launch claude` → pick the model → **Claude Code running** | Core payoff, shown on screen |
| 5:30 | Real job: a calculator app; "small model takes its sweet time"; trade-off = your time | Honest trade-off |
| 6:17 | Calculator works (2+2, ×8, ÷8) | Proof |
| 6:33 | Alternative 1: **FreeLLMAPI** (stack free tiers, Docker); shows a localhost-port error and the fix | Breadth + honest error |
| 10:09 | Alternative 2: **OpenCode** ("easiest, not Claude Code but basically the same") | Easy exit for beginners |
| 11:15 | "Free Claude Code map": Ollama = control, FreeLLMAPI = choice, OpenCode = easy | Recap / decision guide |
| 11:30 | "Which one are you trying first?" + free list + like/subscribe | Comment + lead magnet CTA |
| 12:03 | "The algorithm gods decided you'll enjoy this video next" | **End-screen hook** |

## Side by side
| | Sharbel | Ours (v3) | Verdict |
|---|---|---|---|
| Length | 12 min | ~21 min | ⚠️ ours is long for the same promise |
| Hook | Pain: cost **and** "stops mid-task at your limit" | Price only ("$20 a month… wrong") | ➕ add the limit pain |
| Promise | "By the end you'll have…" | Roadmap of 3 methods | ✅ ours stronger; ➕ add the one-line end-state |
| Mental model | Brain vs harness | Phone + SIM (intro only) | ✅ equal; ours is more visual |
| Model choice | Clear RAM tiers, shown in 30 s | ChatGPT prompt + Task Manager | ➕ add a RAM-tier graphic (keep the ChatGPT tip as a bonus) |
| **Claude Code actually running on Ollama** | ✅ shown + calculator test | ❌ **not recorded** (graphic only) | 🚩 **biggest gap: his main payoff is our missing scene** |
| Wi-Fi off proof | ❌ | ✅ | ⭐ our differentiator |
| Cloud free models | FreeLLMAPI (Docker, fiddly) | OpenRouter (simple) + paid-login trap | ⭐ ours |
| Multi-provider auto-switch | FreeLLMAPI | OmniRoute + **real Claude Sonnet in logs** | ⭐ ours (real Claude is the big claim he can't make) |
| Receipts ($0 bills, logs) | ❌ | ✅ every method | ⭐ ours |
| Honest failures | One port error | Paid trap, 503, app fixes | ⭐ ours |
| Easiest option for beginners | OpenCode | ❌ none | ➕ optional 30 s bonus mention |
| Lead magnet | Free model list (first link) + newsletter | Prompts in description | ➕ add a "free setup kit" (model list + prompts) as the first link |
| Platform | Mac | Windows | ⭐ ours serves Windows users (most of his comments ask for it) |
| End-screen hook | "Algorithm gods…" | Standard outro | ➕ add an end-screen line |

## Draft teleprompter plan v4 (target ~14–15 min)
| # | Time | Section | Change from v3 |
|---|---|---|---|
| 1 | 0:00 | **Pain hook:** "$20 a month, and the second you hit your limit mid-task, it just stops… what if it was free?" | NEW pain line |
| 2 | 0:15 | Phone + SIM example + **end-state promise** ("By the end, you'll have the real Claude Code running for $0, three ways") + roadmap + stay-till-end | Tightened |
| 3 | 0:55 | Trust (not sponsored, receipts) | Shortened to 2 lines |
| 4 | 1:10 | Method 1, Ollama: install, context 64K | Same |
| 5 | 1:50 | **RAM tiers graphic** ("find your RAM") + ChatGPT tip as a 1-line bonus + **free model list in the first link** | NEW |
| 6 | 2:40 | Wi-Fi off → offline app | Same (our edge) |
| 7 | 3:30 | **🚩 `ollama launch claude` → Claude Code running locally → small real task** | **NEEDS RECORDING** |
| 8 | 4:30 | Honest trade-off (slow on a normal laptop) → "let's go faster" | Same |
| 9 | 4:50 | Method 2, OpenRouter: key with $0 limit, free filter, settings block, **the trap**, $0 bill, 429 cap | Trimmed ~40% |
| 10 | 8:00 | Comment hook | Same |
| 11 | 8:10 | Method 3, OmniRoute: install, providers (Kiro ⚠, Antigravity ⚠, NVIDIA key, Gemini), combo, OmniRoute key, shortcuts | Trimmed ~30% |
| 12 | 11:30 | Moment of truth: 503 → real Claude Sonnet in logs | Same (climax) |
| 13 | 12:15 | Build test (test machine, honest fixes) | Trimmed to 40 s |
| 14 | 13:00 | **"Free Claude Code map"**: which one for you (+ optional OpenCode one-liner) + 4 rules | Merged |
| 15 | 13:45 | Close: "Same Claude Code. Zero bill." + free kit (first link) + comment + subscribe | Same |
| 16 | 14:20 | **End-screen hook** line | NEW |

## 🚩 Flags: what's required
| # | Item | Type | Owner |
|---|---|---|---|
| 1 | **Record `ollama launch claude` → pick model → Claude Code running → small task (e.g. a calculator) on your laptop**. His whole video rests on this scene. ~3–5 min of screen recording | Recording | Kalyan |
| 2 | Pain-hook line + end-state promise + end-screen line | Face cam | Kalyan |
| 3 | RAM-tier graphic. Confirm tiers that fit **Windows with no graphics card** (we'd verify current model names before publishing) | Graphic | Claude |
| 4 | Free setup kit / model list for the "first link" (Google Doc / Notion / GitHub page) | Asset + link | Kalyan to choose the host; Claude drafts |
| 5 | Decide the length: ~14–15 min (recommended) vs keep ~21 | Decision | Kalyan |
| 6 | Optional: OpenCode one-liner as the "easiest option" (not Claude Code) | Decision | Kalyan |
| 7 | Newsletter / community plug? (he has one, we don't) | Decision | Kalyan |
| 8 | Title angle: his "Unlimited… Runs On Your Computer" vs ours "$0, with receipts / real Claude" | Decision | Kalyan |
