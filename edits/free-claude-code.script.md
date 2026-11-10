# Free Claude Code: 3 ways (full video plan, v2)

Matches the reference beat for beat: Outskill, "Stop Paying for Claude Code" (youtu.be/HsgsYdV1XoQ).
Kilo Code bonus dropped. Target **~20 min**.
- **Format:** Kalyan on camera for the intro, transitions and conclusion. During screens: full-screen recording with Kalyan in the
  rounded PiP card, bottom-left.
- **Call to action:** description + pinned comment.
- **Kiro / Antigravity:** warning cards, as in the reference.

**Clip names**
- `142752` etc. = Kalyan's recordings (`media/screen-recordings/free-claude-code/2026-11-0X_<name>.mp4`).
- `CR-07` etc. = Claude-recorded clips (`media/screen-recordings/claude-recorded/`).
- Full timestamp map: `edits/free-claude-code.footage.md`.

**Legend:** **SAY** = teleprompter line (face cam, or voiceover with PiP), **SHOW** = clip @ time, **GFX** = HyperFrames graphic.
Rules from AGENTS.md apply: every sentence gets a visual, big and full-frame, no text-in-box lists, captions ≤ 5 words.

| # | Section | Target |
|---|---|---|
| 0 | Intro: the engine swap | 0:00–1:00 |
| 1 | Ollama: free, on your laptop | 1:00–6:30 |
| 2 | OpenRouter: free, in the cloud | 6:30–10:30 |
| 3 | OmniRoute: many free engines + real Claude | 10:30–18:00 |
| 4 | Honest truth, which one to pick, 4 rules | 18:00–19:30 |
| 5 | Conclusion + outro | 19:30–20:30 |

---

## 0 · Intro (0:00–1:00) — face cam

**SAY**
> Claude Code costs twenty dollars a month. At least, that's what everyone says.
> But the twenty dollars isn't for Claude Code. It's for the AI model running inside it.
> Claude Code itself, the app that reads your files, writes your code and runs commands, is free.
> So today, I'll keep Claude Code and swap the engine inside it. Three times.

**GFX** Car metaphor, full screen: body = "Claude Code", engine = "AI model". The engine pops out and three engines slide in:
laptop "Ollama · on your laptop", cloud "OpenRouter · free in the cloud", switch "OmniRoute · switches when one runs out".

**SAY**
> The first one runs completely on my laptop. Even with the Wi-Fi off.
> The second one runs free in the cloud.
> And the third one connects lots of free AI services together, and switches when one runs out.
> So let's start with step one.

**GFX** Full-screen numbered transition **1 · Ollama**.

---

## 1 · Ollama (1:00–6:30)

### 1.1 Install (1:00–1:30)
**SAY**
> The first engine is Ollama. Go to ollama.com and click download. Windows, Mac or Linux.
> Run the installer, and that's it.

**SHOW** `142752` @ 0:00–1:35, sped up 3×. Skip 2:06–2:50 (PowerShell noise).

### 1.2 Three things that matter (1:30–2:30)
**SAY**
> Three things matter here.
> Apps. Claude Code, Codex, OpenCode… Clicking one doesn't install anything. It copies the command to connect it.
> Chat, where we test models.
> And Settings. Leave Cloud off, because we want everything on our laptop.
> The one that really matters is context length. It's how much of your project the model can keep in its head.
> Claude Code reads your files before editing them, so set it to 64K.

**SHOW** `142752` @ 3:04–3:20 (Apps grid, zoom) → @ 3:41–4:13 (Settings: Cloud toggle, then the Context length slider, coral ring).

### 1.3 First test, offline (2:30–3:45)
**SAY**
> Open Chat and pick a small model to warm it up. Qwen 3.5 4B. Say hi.
> The first message downloads the model, so give it a minute.
> But "hi" proves nothing. Watch this. Wi-Fi off.
> And I ask it to make a simple notes app.
> It's thinking… and it writes the whole thing. No internet. Every word from a model on this laptop.
> No usage limits, no waiting five hours for a reset, and your code never leaves your computer.

**SHOW** `142752` @ 5:48 (downloading) → 6:20–7:23 "hi" (4× on the thinking) → **7:28–7:40 Wi-Fi switched off** (zoom on the
Wi-Fi tile; "OFFLINE" stamp) → 8:52–11:05 "make a simple notes app" + code (8×).
Skip the calculator attempt at 7:56–8:48 (its answer was cut off).

**SAY**
> I turn the Wi-Fi back on for one reason: to paste the code into a free online compiler.
> First try, wrong language. Switch to HTML… and it runs.
> Is it pretty? No. But a laptop with no internet just wrote working software.

**SHOW** `142752` @ 11:37–12:41 (OneCompiler: red error for 1 s, then HTML, Quick Notes appears, type "hi", Add).

### 1.4 Which model should you run? (3:45–4:45)
**SAY**
> Which model should you actually run? Don't memorise charts. Ask an AI.
> Check your hardware: Ctrl + Shift + Escape, Performance tab.
> Mine has 8 GB of graphics memory and 16 GB of RAM.
> I gave ChatGPT exactly that, and asked for the best coding model with its exact Ollama name.
> Then one follow-up: is this still the latest? New models come out every week.
> Its answer: MiMo v2.6 9B.

**SHOW** `145317` @ 0:00–1:15 (Task Manager: zoom "8 GB", "16 GB") → @ 1:40–3:20 (ChatGPT).
**GFX** The prompt as a big typed prompt window (not the copy-paste), highlighting "8 GB VRAM", "exact Ollama name", "latest".
End card "→ mimo-v2.6:9b".

### 1.5 First problem, so an AI installs it (4:45–5:45)
**SAY**
> First problem: it's not in Ollama's dropdown.
> I tried the terminal. Error: my Ollama was too old. Updated it. Still stuck.
> This is where a five-minute setup turns into an hour on Google.
> So I let another AI do it. Antigravity, a free coding tool from Google that can run commands on your computer.
> One sentence: install MiMo and set it up so it works with Ollama.
> It asks permission a few times. Read each one, then allow.
> A few minutes later: installed, tested, working.

**SHOW** `145317` @ 3:46 (dropdown, circle the missing model) → 4:36–5:01 (red "requires newer version" + update) → 5:26–7:07
(Antigravity download + sign-in, 6×) → 8:47–10:03 + `151536` (prompt, permission cards; montage "allow ×4") → `121640` @ 0:00–0:06
("successfully installed").

**SAY** (house rule, face cam)
> That's the rule for this whole video: anything longer than one line, you don't type it. An AI installs it.
> If something breaks, copy the error, paste it back, and say "fix this".

### 1.6 Claude Code on Ollama (5:45–6:30) — no fake footage
**SAY**
> Now connect Claude Code. In Ollama, Apps → Claude Code. That copies the launch command.
> Make a folder, open it in Terminal, paste.
> Ollama runs Anthropic's real Claude Code installer, then asks which model to use.

**SHOW** `121640` @ 0:09–0:30 (Apps → "Launch command copied" toast, zoom) → @ 0:33–0:54 (new folder → Open in Terminal).
**GFX** A clean animated terminal showing the single command `ollama launch claude`, then a model picker card ("mimo-v2.6:9b").
Label it "One command". **Do not** show a fake Claude Code session.

**SAY** (face cam, transition)
> But here's the honest part. On an 8 GB laptop, local models are slow.
> And small models often struggle with Claude Code's tools.
> So let's upgrade. The next engine runs in the cloud. Faster, smarter, still free.

**GFX** Numbered transition **2 · OpenRouter**.

---

## 2 · OpenRouter (6:30–10:30)

### 2.1 Key (6:30–7:15)
**SAY**
> OpenRouter is a middleman: one key, dozens of AI models, and many of them are free.
> Sign up at openrouter.ai, no credit card. API Keys → Create.
> Give it a name, set an expiry (mine is seven days) and a credit limit of zero. That's your seat belt.
> Copy the key now. It's shown once. Treat it like a password.

**SHOW** `154411` @ 1:34–2:05 (create key: 7 days, credit limit). **Blur the key.**

### 2.2 Free models (7:15–7:45)
**SAY**
> In Models, set the price filter to free. Look for ":free".
> This list changes every month, so don't remember names. Remember the filter.

**SHOW [B-ROLL]** `npm run broll -- "https://openrouter.ai/models?max_price=0" --name openrouter-free` (scroll; ":free" highlighted).

### 2.3 Plug it in, and the trap (7:45–9:00)
**SAY**
> To plug it into Claude Code you need a small settings block. It's in the description.
> Only change one thing: your key goes between these quotes.
> One line clears the old key, so there's no paid fallback.
> And these three lines map Claude Code's Opus, Sonnet and Haiku seats to free models.

**GFX** The settings block as a code card (from `121640` @ 1:03), annotated line by line: "send to OpenRouter" / "your key" /
"no paid fallback" / "seats → free models".

**SAY**
> My first paste failed, and I didn't notice. I typed claude and it opened. Looks fine?
> Look at the top: Opus 5.5, Claude Pro. It skipped OpenRouter and used my paid account.
> So always check this line.

**SHOW** `121640` @ 1:12 (paste warning) → 2:34 (red parse errors, zoom) → 3:01 (banner "Opus 5.5 · Claude Pro", circled) → 3:19
(/status "Claude Pro account"). Big red stamp **"Not free!"**

**SAY**
> Fresh terminal, one line at a time. Now it says openrouter/free, API Usage Billing. That's the free engine.

**SHOW** `123051` @ 0:00–4:00 (8×, key blurred) → 4:18 (banner "openrouter/free", green tick).

### 2.4 Check the receipt (9:00–10:00)
**SAY**
> /model still says Opus, Sonnet, Haiku. Did we get Claude for free? No.
> I asked "which model are you?" It says it's a free model on OpenRouter.
> The real proof is OpenRouter's Activity page: three requests, zero dollars.
> And Claude Code's own usage screen says thirteen cents? That's an estimate at Anthropic's prices. The real bill is zero.

**SHOW** `123051` @ 4:36 (/model) → 5:13–5:31 (which model + answer) → 5:50–6:45 (Activity: count-up "$0.00", "3 requests") → 7:04
(/usage "$0.1348", circled with "Estimate ≠ bill").

### 2.5 The catch (10:00–10:30)
**SAY**
> The catch: your prompts go to someone else's server.
> And free models are capped at about 50 requests a day. One Claude Code task can use 10 or 20.
> Hit the cap and you get error 429. That wall is why method three exists.

**GFX** A counter 50 → 0 in chunks (file / write / check icons), ending on a "429 · Rate limited" terminal card. Then the
numbered transition **3 · OmniRoute**.

---

## 3 · OmniRoute (10:30–18:00)

### 3.1 What it is + install (10:30–11:45)
**SAY**
> OmniRoute is a free, open-source app on GitHub.
> OpenRouter has a free cap. So do Google, NVIDIA and others. Small on their own, big together.
> OmniRoute puts them in one place, and when one runs out, the next takes over.
> We install it the same way: Antigravity does it.

**SHOW** `154801` @ 0:00 (GitHub repo; zoom "375 providers / 1,400 models").
**GFX** Fuel gauges (provider logos) feeding one OmniRoute hub; one empties, the next lights up.

**SAY**
> One prompt: set up Claude Code so I can use it for free, install OmniRoute, start it, open the dashboard. If anything fails, fix it.
> Lots of permission prompts. Read them.
> The first password is CHANGEME. Change it right away.

**SHOW** `154801` @ 0:31 (prompt as a typed prompt window) → 0:42–1:03 (permission montage) → 1:13–1:34 (summary table, rows tick
off) → 1:55 (sign-in) → 2:06 (Home). Cut the 404 at 1:45.

### 3.2 Connect free engines (11:45–14:30)
**SAY**
> Now we plug engines in. Go to Providers.

**SHOW** `154801` @ 2:27–3:41 (Providers, 4×).

Each provider gets a 6–10 s beat with a logo card and a status pill.

**SAY** Kiro
> Kiro. Sign in, approve the device… connected. It has real Claude models: Sonnet and Haiku.
> But the free tier is tiny, around 50 credits a month, and Kiro now shows a "subscription required" page.
> OmniRoute itself flags Kiro's terms. Your account, your call.

**SHOW** `113521` @ 0:15–1:10 (device login → "Device authorized" → connected). **GFX** Warning card ⚠ "ToS: avoid · your account,
your call". Keep the "Subscription Required" tab visible for 1 s.

**SAY** Antigravity
> Antigravity. Sign in with Google and you get Gemini, plus some Claude models within a limit.
> Same warning, and this one is stronger: Google may restrict the account. Use a spare Google account.

**SHOW** `113521` @ 1:40–3:45 (Google sign-in → callback → connected; topology shows Gemini, Kiro, Antigravity). **GFX** Warning card ⚠.

**SAY** NVIDIA
> NVIDIA: a free key from build.nvidia.com, about 40 requests a minute.
> My check failed: "unable to get local issuer certificate".
> That's my laptop's network inspecting secure traffic, which is common on work laptops. The key was fine.
> On a home laptop it works.

**SHOW** `163037` (sign-up, 8×; skip the captcha) → `113521` @ 4:20–5:20 (Generate key → paste → "Invalid · fetch failed") → 7:35–7:50
(test message: `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, zoomed). **GFX** "Expect errors" stamp. Blur keys.

**SAY** Gemini + OpenRouter
> Gemini: a free key from Google AI Studio. OpenRouter: the same free key from method two.
> And turn on "Import only free models" wherever you see it.

**SHOW** `154411` @ 0:00–1:03 (AI Studio key → Gemini connected) → `144707` @ 0:40–0:57 (the "Import only free models" toggle,
coral ring). Leave out the G4F page (`113521` @ 5:40).

### 3.3 The combo (14:30–15:30)
**SAY**
> Now one combo, a pool of engines that work together. Mine is called Claude.
> Steps: Gemini, Kiro's Claude Sonnet, then free Kimi, Qwen, DeepSeek, NVIDIA and Groq as backups.
> Strategy: smart routing, so it picks for me every time. I don't switch providers by hand any more.
> Then API Keys: one master key that unlocks the whole combo.

**SHOW** `114247` @ 0:00–0:25 (`omniroute` starting in PowerShell) → 1:00–3:20 (Edit Combo: steps, Mode Pack "Ship Fast", Rules
scoring, Model Sequence; 3×) → 3:30–3:55 (Intelligent Routing dashboard) → `154411` @ 11:32 (Create API Key).

### 3.4 Shortcuts + free models only (15:30–16:15)
**SAY**
> Back to Antigravity. One prompt: put two shortcuts on my desktop.
> "Free Claude Code" starts OmniRoute if needed and opens Claude Code through it. "OmniRoute Dashboard" opens the dashboard.
> One more trap: Claude Code's model menu shows paid models too.
> So hide paid models in OmniRoute, and keep "claude" as the default.
> Now the menu only shows free options.

**SHOW** `160207` @ 0:05–0:38 (prompt → "What Was Created" table → Testing & Verification) → 1:43 (desktop with both icons, pop).
→ `CR-01` @ /model menu (free-only list, ~4 s).
**GFX** The two prompts as typed prompt windows (text in the description).

### 3.5 Moment of truth (16:15–17:00)
**SAY**
> Moment of truth. Double-click Free Claude Code.
> OmniRoute is running, Claude Code opens. I ask: which model are you?
> First try: error 503, Kiro is busy. Normal with free setups. Ask again.
> It answers: Claude. But a model's word isn't proof. Check the receipt.
> OmniRoute logs: claude-sonnet-4.5, provider Kiro, combo Claude, status 200.
> That's real Claude Sonnet answering, through a free Kiro account.

**SHOW** `121406` @ 0:00–0:20 (desktop double-click → launcher → Claude Code) → 0:20–1:05 (question → 503; **cut the wait to 3 s**)
→ 2:10–2:30 (second answer) → 2:40–3:00 (Home recent requests → Logs; **zoom the KIRO · claude-sonnet-4.5 · combo Claude · 200 row**).
Optional: `CR-01` (model claims to be "Claude Fable 5" while the logs say Kiro Sonnet 4.5) as a 3 s insert for "a model's word isn't proof".

### 3.6 Real test: a note-taking app (17:00–18:00)
**SAY**
> Now a real test. "Design me a simple personal note-taking application."
> In plan mode, Claude Code doesn't start coding. It asks first: tech stack, features, storage.
> Then it shows a plan, and only then builds.
> Real Claude did the planning, until its free limit ran out.
> Then OmniRoute switched to free NVIDIA and kept going. I didn't touch anything.
> It took a few fix rounds, and that's normal. But here it is: a working notes app on my own computer.
> Tags, search, Markdown preview, and the notes survive a refresh. Zero dollars.

**SHOW** `CR-04` (questions → plan → build; speed 10–20×, hold 2 s on each question screen and the plan) → **GFX** a log strip
"Claude Sonnet 4.6 ×31 → 429 → NVIDIA Nemotron ×130 · $0" → `CR-05` (2 s of the fix being applied) → `CR-07` (app: new note,
tags, Markdown, filter, search, refresh → still there).

---

## 4 · Honest truth + which one + rules (18:00–19:30) — face cam → full screen

**SAY**
> Let me be straight. Titles saying "unlimited free Claude" aren't true.
> What you get is the real Claude Code app, a small taste of real Claude, and free engines for everything else.
> For most people, that's enough.

**GFX** Big line: ~~"Unlimited free Claude"~~ → "Real Claude Code + free engines".

**SAY**
> Which one should you use?
> Good graphics card, and privacy matters? Ollama. It even works offline.
> No hardware, and you want speed today? OpenRouter. Remember the daily cap.
> And if you want Claude Code to keep going when one provider runs out? OmniRoute.

**GFX** Three flow cards growing in turn (laptop / cloud / switch), each with one line.

**SAY**
> Four rules.
> One: nothing is unlimited.
> Two: free cloud engines see what you send. Keep client code and passwords on Ollama.
> Three: some connections, like Kiro and Antigravity, are against those services' terms. Your account, your call.
> Four: expect errors. Copy, paste, "fix this".
> And whatever the menu says, check the receipt.

**GFX** Four numbered icon tiles (∞ crossed out, eye, warning, wrench), then a receipt stamped "$0.00".

---

## 5 · Conclusion + outro (19:30–20:30)

**SAY** (face cam)
> Everyone says Claude Code costs twenty dollars a month.
> Today we ran the real Claude Code with free engines inside it. Three ways.
> One works with the Wi-Fi off, one runs in the cloud, and one switches between free engines on its own.

**Outro** (ElevenLabs voice clone over full-screen graphics, standard):
recap → Like → Subscribe → bell for "AI with Kalyan" → description panel → pinned comment card →
"Thanks for watching / See you in the next video".
> And that's how you run Claude Code for free. Every prompt, the settings block and all the links are in the description and
> the pinned comment. Tell me which setup you're trying first. If this helped, like the video and subscribe to AI with Kalyan.
> Thanks for watching, and I'll see you in the next video.

**Pinned comment:** "Which setup are you trying first: Ollama, OpenRouter or OmniRoute? 👇"

---

## Description / pinned comment assets
1. ChatGPT model-picking prompt (+ "is this still the latest?").
2. Antigravity: install-the-local-model prompt.
3. OpenRouter settings block (PowerShell + cmd), placeholder key.
4. Antigravity: OmniRoute install prompt.
5. Antigravity: desktop shortcuts prompt.
6. Antigravity: hide-paid-models prompt (Kalyan's text).
7. Links: ollama.com, openrouter.ai, github.com/cheaper-inference/OmniRoute, build.nvidia.com, aistudio.google.com,
   antigravity.google, kiro.dev.
8. Disclaimer: free tiers change; cloud providers may see prompts; Kiro / Antigravity connections may break their terms.

## Pickups (face cam only)
Intro, the "house rule", the end of section 1 transition, the section 4 lines, the conclusion. Every other line is voiceover over
the screens, with the PiP.

## Edit notes
- Blur every API key and email.
- Speed: installs and sign-ups 4–8×, Claude Code thinking 8–20×.
- Claude-recorded clips (`CR-*`) are Linux/Chrome. Use them only where Kalyan's footage has no equivalent (the /model menu, the
  notes app).
- Audio: music bed 0.11, ducked under speech; SFX ≥ 0.9 s apart; mix to −14 LUFS, −1 dBTP.
