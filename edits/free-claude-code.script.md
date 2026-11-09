# Free Claude Code: 3 ways (script v1)

Reference: Outskill, "Stop Paying for Claude Code (3 Ways to actually use it for FREE!!)"
(youtu.be/HsgsYdV1XoQ, 31:34). Same structure: car/engine framing, then Ollama → OpenRouter →
OmniRoute, honest limits, "which one should you use", rules. Kilo Code bonus dropped.

Footage: Drive "Screen Recordings" (10 files, silent) → `media/screen-recordings/free-claude-code/`.
Times below are `file @ mm:ss`. **[PICKUP]** = not in the recordings yet, record it.

Format: Kalyan to camera for the intro, transitions and conclusion. Screen recordings run full-screen
with Kalyan in the rounded PiP card bottom-left while he explains them. Target length ~16–18 min.

---

## 0. Intro (camera)

**SAY**
> Claude Code costs twenty dollars a month. At least, that's what everyone says.
> But the twenty dollars isn't for Claude Code. It's for the AI model running inside it.
> Claude Code itself, the app that reads your files, writes the code and runs the commands, is free.
> So today, I'm going to keep Claude Code and swap the engine inside it with a free one.
> Three different ways.

**SHOW** full-screen graphic: a car. Body = "Claude Code", engine = "AI model". The engine pops out
and three engines slide in one by one: laptop icon "Ollama: runs on your laptop", cloud icon
"OpenRouter: free in the cloud", switch icon "OmniRoute: switches when one runs out".

**SAY**
> The first one runs completely on my laptop.
> The second one runs free in the cloud.
> And the third one connects lots of free providers and switches between them when one runs out.
> So let's start with step one.

**SHOW** full-screen numbered transition "1 · Ollama: free AI on your own laptop".

---

## 1. Ollama: free AI on your laptop

### 1a. Install

**SAY**
> The first engine is called Ollama.
> Go to ollama.com and click download. It works on Windows, Mac and Linux.
> I'm on Windows, so I'm downloading the installer, double-clicking it, and that's it.

**SHOW** `2026-11-05_142752 @ 00:00–01:35` (ollama.com → Download → installer in Downloads).
Skip the PowerShell "run is not recognised" error at 02:06–02:50, it's noise.

### 1b. The three things that matter

**SAY**
> Once it's open, there are three things you need to know.
> First, Apps. Claude Code, Codex, OpenCode, and more.
> Clicking one doesn't install anything. It just copies the command to connect Ollama to that tool.
> Second, Chat. This is where we test models.
> And third, Settings.
> The Cloud toggle runs models on Ollama's servers. We want everything on our laptop, so leave it off.
> And the one that actually matters is context length.
> That's how much of your project the model can keep in its head at once.
> Claude Code reads your files before it edits them, so if this is too low, it loses track.
> Set it to 64K.

**SHOW** `142752 @ 03:10` Apps grid → `@ 03:41–04:13` Settings. Zoom in on the Cloud toggle, then
on the Context length slider with a coral highlight. **[PICKUP]** a 3 s clip of the slider being
set to 64K if it isn't in the recording.

### 1c. First test

**SAY**
> Now open Chat and pick a small model. I'm using Qwen 3.5 4B, just to warm it up.
> I say hi. The first message downloads the model, so it takes a minute.
> But "hi" doesn't prove anything. So I asked it to make a simple notes app.
> And it starts thinking, and writes the whole thing, completely on my laptop.

**SHOW** `142752 @ 05:48` downloading model → `@ 06:20–07:23` "hi" → `@ 08:58–11:05` "make a simple
notes app", thinking, code streaming. Speed up the thinking parts 4–8×, with a small "4×" badge.

**[PICKUP, optional but strong]** Wi-Fi off, browser shows "No internet", same prompt still answers.
The reference's best moment, and only 15 s of recording.

**SAY**
> To check it actually works, I pasted the code into a free online compiler.
> It failed the first time because I picked JavaScript. It's an HTML file.
> Switched to HTML, hit Run, and there it is. A working notes app.
> Is it pretty? No. But no subscription, no usage limits, and nothing left my laptop.

**SHOW** `142752 @ 11:37–12:41` OneCompiler: red error (keep it, 1 s), switch to HTML, Quick Notes
app appears, type "hi", Add Note.

### 1d. Which model should you run?

**SAY**
> But which model should you actually run? Don't memorise charts. Just ask an AI.
> First, check your hardware. Press Ctrl + Shift + Escape and open the Performance tab.
> My laptop has 8 GB of graphics memory and 16 GB of RAM.
> So I asked ChatGPT: "I have 8 GB of VRAM and 16 GB of RAM. I want to run a local model on Ollama
> for coding. Give me the best model for my use case and its exact Ollama name."
> And always ask one follow-up: is this still the latest?
> Because new models come out every week, and the first answer is often outdated.
> It came back with MiMo v2.6 9B.

**SHOW** `2026-11-05_145317 @ 00:00–01:15` Task Manager → GPU / Memory (zoom on "8 GB" and "16 GB",
then an animated chip card "8 GB VRAM · 16 GB RAM"). `@ 01:40–03:20` ChatGPT prompt typed, answer.
Show the prompt as a big typed prompt window (not the copy-paste), highlight "8 GB VRAM",
"exact Ollama name", "latest". End on a card "→ mimo-v2.6:9b".

### 1e. The first problem (Antigravity fixes it)

**SAY**
> And here's the first problem. It's not in Ollama's dropdown.
> So I tried installing it in the terminal, and got an error. My Ollama was too old.
> Updated Ollama. Tried again. Still not working.
> This is where a simple setup turns into an hour on Google.
> So instead, I used another AI to do it for me. It's called Antigravity, a free coding tool from Google.
> The difference is, it doesn't just chat. It can open your terminal, run commands, read the errors
> and fix them.
> Download it, sign in with Google, and give it one sentence.
> "I'm running an AI model locally. Install this model, MiMo v2.6 9B, and set up everything so it
> works with Ollama."
> It'll ask permission a few times because it's running commands on your machine. Read each one
> before you click allow.
> A few minutes later: installed, tested, and working with Ollama.

**SHOW** `145317 @ 03:46` model dropdown (circle: no mimo) → `@ 04:36–05:01` PowerShell red
"requires ollama version" error + update → `@ 05:26–07:07` Antigravity download & sign-in (fast) →
`@ 08:47–10:03` + `2026-11-05_151536` prompt and permission cards → `2026-11-06_121640 @ 00:00–00:06`
"Setup Summary… successfully installed". Prompt as a typed prompt window. Permission cards: one
real, then quick-cut montage of 3 more with a counter "allow ×4".

**SAY** (house rule, camera or full-screen card)
> And that's the rule for this whole video.
> Anything longer than one line, you don't type it. An AI installs it.
> If something breaks, copy the error, paste it back and say: fix this.

### 1f. Claude Code on Ollama

**SAY**
> Now for the part you came here for.
> In Ollama, go to Apps and click Claude Code. That copies the launch command.
> Make a folder anywhere. Mine is called "Claude code".
> Right-click inside it, open in Terminal, paste, and hit enter.

**SHOW** `121640 @ 00:09–00:30` Ollama Apps → click Claude Code → "Launch command copied" toast
(zoom) → `@ 00:33–00:54` new folder "Claude code" → Open in Terminal → empty PowerShell.

**[PICKUP: needed, not in the recordings]** From that empty terminal:
1. paste the Ollama launch command, Enter; let it install Claude Code if asked (type Y);
2. pick `mimo-v2.6:9b` when it asks for a model;
3. Claude Code banner, showing the Ollama model;
4. prompt: "Build me a simple calculator app", allow file creation, open the result;
5. one follow-up: "make the buttons bigger and switch to dark mode".

**SAY** (over the pickup)
> If Claude Code isn't installed, it asks to install it. Say yes.
> And this is the real Claude Code, Anthropic's official app, not a copy.
> Then it asks which model to use. I'm picking MiMo.
> And there it is. Claude Code, with a free engine running on my own laptop.
> No subscription, no API key.
> I asked it to build a calculator app. It asks permission to create the files. Allow it.
> The first version is rough, but you just keep asking. Bigger buttons. Dark mode.
> Next time, you don't repeat any of this. Open the folder in Terminal and run one line.

**SAY** (camera, transition)
> But you saw it too. It's slow, and on an 8 GB laptop it's not that smart.
> So let's upgrade. The next engine runs in the cloud. Faster, smarter, and still free.

**SHOW** numbered transition "2 · OpenRouter: free models in the cloud".

---

## 2. OpenRouter: free in the cloud

### 2a. Get a key

**SAY**
> The second engine is OpenRouter.
> Think of it as a middleman. One key gives you dozens of AI models, and a lot of them are free.
> Go to openrouter.ai, sign up. No credit card.
> Click API keys, create key, give it a name. Mine is "Claude".
> Set an expiry. I set mine to seven days, so by the time you watch this, it's already dead.
> And set a credit limit. It's a seat belt.
> Copy the key and keep it safe. OpenRouter only shows it once. Treat it like a password.

**SHOW** `2026-11-09_154411 @ 01:34–02:05` OpenRouter "Create a new key": name, expiration
"7 days", credit limit dropdown, the key shown once. **Blur the key.**

**SAY**
> Now click Models and filter by price: free. Look for the ":free" label.
> These models cost zero per request.
> This list keeps changing. Models come and go. So don't remember the names, remember the filter.

**SHOW [B-ROLL]** `npm run broll -- "https://openrouter.ai/models?max_price=0" --name openrouter-free`
(scroll the free list), plus a highlight on ":free".

### 2b. Plug it into Claude Code (and the trap)

**SAY**
> Now we plug this key into Claude Code. It's a small block of settings, and it's in the description.
> You only change one thing: your key goes between these quotes.
> The rest tells this terminal window to send everything to OpenRouter instead of Anthropic.
> One line clears the old key, so there's no chance of falling back to a paid key.
> And these three lines, Opus, Sonnet and Haiku, map Claude Code's model menu to free models.

**SHOW** the env block as a big code card (from `121640 @ 01:03`), animated line by line:
`ANTHROPIC_BASE_URL` → "send it to OpenRouter", `ANTHROPIC_AUTH_TOKEN` → "your key",
`ANTHROPIC_API_KEY = ""` → "no paid fallback", the three `DEFAULT_*_MODEL` lines → "menu seats →
free models".

**SAY** (the trap, from `121640 @ 01:12–03:40`)
> Now, the first time I pasted this, I made a mistake. PowerShell threw errors, and I didn't notice.
> I typed claude, and it opened. Looks fine, right?
> But look at the top. Opus 5.5. Claude Pro.
> It skipped OpenRouter and logged in with my paid account.
> So always check this line. If it says your Claude plan, you're not on the free engine.

**SHOW** `121640 @ 01:12` PowerShell "paste multiple lines" warning → `@ 02:34` red parse errors
(zoom, red outline) → `@ 03:01` Claude Code banner, circle "Opus 5.5 · Claude Pro" → `@ 03:19`
/status "Login method: Claude Pro account". Big red label "Not free!".

**SAY**
> So I opened a fresh terminal and entered each line one by one.
> Type claude. And now look: openrouter/free, API usage billing.
> That's the free engine.

**SHOW** `2026-11-06_123051 @ 00:00–04:00` lines entered (speed ramp 6–8×, key blurred) → `@ 04:18`
banner "openrouter/free · API Usage Billing" with a green check.

### 2c. Is it really Claude? Check the receipt

**SAY**
> Now type /model. Look at that. The seats still say Opus, Sonnet, Haiku.
> So did we just get Claude for free? No. And I'll prove it.
> I asked it, "which model are you?" It says it's a free model on OpenRouter, routed to whatever is
> available.
> Now open OpenRouter's Activity page. This is the real log.
> Three requests, twenty-four thousand tokens, and the cost: zero dollars.
> The menu shows seat names. The activity page shows who's actually sitting in the seat.

**SHOW** `123051 @ 04:36` /model list → `@ 05:13–05:31` "which model are you?" + answer
(highlight "free-tier offering served through OpenRouter") → `@ 05:50–06:45` OpenRouter Activity:
zoom on "Requests 3", "Tokens 24.6K", "$0.00" (count-up from 0).

**SAY**
> One more thing that might scare you.
> Claude Code's usage screen says this session cost thirteen cents.
> Relax. That's Claude Code's own estimate using Anthropic's prices.
> The real bill is on OpenRouter, and there it's zero.

**SHOW** `123051 @ 07:04` /usage "Total cost $0.1348 (costs may be inaccurate…)" circled, side by
side with OpenRouter "$0.00". Card: "Estimate ≠ bill".

### 2d. The catch

**SAY**
> But here's the honest part.
> Your prompts and files now go to someone else's server. So be careful what you send.
> And the free models are capped: 20 requests a minute, and 50 a day on a new account.
> Fifty sounds like a lot, but one task in Claude Code can use ten or twenty requests,
> because it reads files, writes them, checks its work and fixes it.
> One real session can use up your whole day.
> And then you get error 429. Rate limited. Come back tomorrow.
> That wall is exactly why method three exists.

**SHOW** animated counter 50 → 0 in chunks of 10–20 with file/write/check icons per chunk, ending
on a terminal card "429 · Rate limited". Then numbered transition "3 · OmniRoute: many free
engines, one switch".

---

## 3. OmniRoute: many free engines in one place

### 3a. What it is + install with Antigravity

**SAY**
> The third one is OmniRoute. It's a free, open-source app on GitHub.
> OpenRouter has a free limit. But so do lots of other services.
> On their own, each one is small. Together, they add up.
> OmniRoute puts them all in one place, and when one runs out, it can switch to the next.
> One engine runs out of fuel, another one takes over.
> And we install it the same way: Antigravity does the work.

**SHOW** `2026-11-06_154801 @ 00:00` OmniRoute GitHub repo (zoom on the description "375 providers…
1,400+ models"). Then animated graphic: several small fuel gauges (provider logos) feeding one
"OmniRoute" hub, one gauge empties and the next lights up.

**SAY**
> I gave it one prompt: set up Claude Code on my Windows laptop so I can use it for free.
> Check if Claude Code is installed, install OmniRoute from GitHub, start it, and open the dashboard.
> If any step fails, fix it and keep going.
> Again, it asks permission a lot. Read each one.
> And at the end, it gives me a summary: Claude Code found, OmniRoute installed, server running,
> dashboard opened.

**SHOW** `154801 @ 00:31` prompt (big typed prompt window, highlight "free", "install OmniRoute",
"if any step fails, fix it") → `@ 00:42–01:03` permission cards (montage) → `@ 01:13–01:34`
Step-by-Step Summary table (animate the four rows ticking off).

**SAY**
> Open the dashboard. The first time, the password is CHANGEME. Change it straight away in settings.

**SHOW** `154801 @ 01:45` 404 (cut it) → `@ 01:55` OmniRoute sign-in → `@ 02:06–02:16` Home.

### 3b. Connect free providers

**SAY**
> Now we connect free engines. Go to Providers.
> I tried a few, and I'll be honest about how each one went.

**SHOW** `154801 @ 02:27–03:41` Providers list / onboarding wizard (fast scroll, 4×).

Then one quick card per provider. Each card has the logo, how you connect it (key or sign-in), and
a coral status pill. Keep each 5–8 s.

**SAY**
> Kiro: you sign in, and it has real Claude models. But it's only 50 credits a month, and OmniRoute
> itself warns that Kiro's terms don't allow this. Your account, your call.

**SHOW** `154801 @ 03:51–04:10` "Connect Kiro AI" dialog. Pill: "⚠ terms risk".

**SAY**
> NVIDIA: free account at build.nvidia.com, create an API key and paste it in.
> Mine showed "invalid" on the check, so I'll come back to that.

**SHOW** `2026-11-07_163037` sign-up (fast, 8×, skip the captcha after 1 s) → `2026-11-09_144707
@ 00:20` "API Key Granted" (blur) → `@ 00:40–00:57` paste, "Import only free models" toggle on
(highlight it, it matters), red "Invalid / Test failed". Pill: "✗ check failed".

**SAY**
> OpenRouter: same free key from method two.
> Gemini: free key from Google AI Studio. This one connected straight away.
> Cline and Grok: you just sign in.
> And Kimi Code needs a paid plan, so I skipped it.

**SHOW** `154411 @ 00:00–01:03` AI Studio key → Gemini provider (pill "✓ connected") → `@ 03:08`
Cline authorise → `@ 04:11–05:46` Grok Build sign-in → `@ 06:49–07:52` Kimi pricing ($15/mo, pill
"paid, skipped").

**[PICKUP]** after the fix in 3e: the Providers page with the final green/red state of each.

### 3c. Combo + API key

**SAY**
> Now we put them into one combo. A combo is just a pool of engines that work together.
> Go to Combos, create one, add the models, and pick how it chooses between them.
> Then go to API Keys and create a key. This is the master key that unlocks the whole combo.

**SHOW** `154411 @ 10:29–11:01` Create Combo (models list, router strategy) → `@ 11:32` Create API Key.
Blur keys.

### 3d. Desktop shortcuts

**SAY**
> Back to Antigravity one more time.
> I asked it to make a shortcut on my desktop called "Free Claude Code".
> When I double-click it, it checks OmniRoute is running, opens a terminal in a work folder, and
> starts Claude Code through OmniRoute.
> And a second shortcut that opens the OmniRoute dashboard.
> One important thing: never paste your key into the chat. Let it read the key from a file.

**SHOW** `2026-11-09_160207 @ 00:05–00:16` shortcut prompt (typed prompt window) → `@ 00:21–00:38`
"What Was Created" table + Testing & Verification (tick rows) → `@ 01:43` desktop with both icons
(zoom + pop).

### 3e. Moment of truth (and the error)

**SAY**
> All right, moment of truth. Double-click "Free Claude Code".
> Terminal opens, OmniRoute is running, Claude Code loads. I say hi.
> And… error. Retrying. Then 503: "all targets were skipped".
> So it didn't work the first time. And honestly, that's normal with these setups.
> Remember the rule: copy the error, paste it into Antigravity, and say fix this.

**SHOW** `160207 @ 01:48–02:10` Free Claude Code launch → "hi" → red "API error · retrying" →
"503 … all targets were skipped by pre-dispatch filter" (zoom, shake, red outline). Then
`160207 @ 00:43–01:32` OmniRoute Logs page, mostly red rows (zoom on a few).

**[PICKUP: needed]** Run the fix below, then record:
1. the fix prompt pasted into Antigravity, and its summary;
2. Free Claude Code → "hi" → it replies;
3. "which model are you?";
4. OmniRoute Logs: green row, provider Gemini;
5. a real task, e.g. "Design me a simple personal note-taking app". Let Claude Code ask its
   questions, answer them, show the plan, the app on localhost, create a note, close, reopen, and
   the note is still there.

**SAY** (over the pickup, edit to match what actually happens)
> It found the problem: [one line, e.g. "the combo only had providers that weren't working"].
> Fixed it, double-click again, say hi, and this time it answers.
> Now don't trust what the model says about itself. Check the receipt.
> OmniRoute logs: provider Gemini, cost zero.
> And now a real test. I asked it to design a simple note-taking app.
> It doesn't just start coding. It asks me questions first, makes a plan, then builds it.
> A few minutes later, a working app on my own computer. Zero dollars.

---

## 4. Honest part + which one to use (camera → full-screen)

**SAY**
> Now let me be straight with you.
> You've probably seen titles saying "unlimited free Claude". That's not true.
> There's no setup today that gives you unlimited real Claude for free.
> What you actually get is the real Claude Code app, with free engines inside it.
> And for most people, that's enough.

**SHOW** big closing-line card: ~~"Unlimited free Claude"~~ → "Free Claude Code + free engines".

**SAY**
> So which one should you use?
> If you have a good graphics card and privacy matters, use Ollama. It even works offline.
> If you don't have the hardware and just want speed today, use OpenRouter. Just remember the 50 a day.
> And if you want Claude Code to keep going when one provider runs out, use OmniRoute.

**SHOW** three flow cards growing in turn, each with its icon and one line:
Ollama "Private · offline · your hardware" / OpenRouter "Fast · no hardware · 50/day" /
OmniRoute "Many engines · auto-switch · more setup".

**SAY**
> And four rules before you start.
> One: nothing is unlimited. Every free tier has a cap.
> Two: free cloud engines see what you send. Keep client code and passwords on Ollama.
> Three: some connections, like Kiro, break the provider's terms. Your account, your call.
> Four: expect errors. Copy the error, paste it into Antigravity, and say fix this.
> And one final rule: whatever the menu says, check the receipt.

**SHOW** four numbered icon tiles appearing one per sentence (∞ crossed out, eye, warning sign,
wrench), then a "receipt" graphic stamped "$0.00".

**SAY** (closing line, camera)
> Everyone says Claude Code costs twenty dollars a month.
> Today, we ran the real Claude Code with free engines inside it. Three different ways.

---

## 5. Outro (voice clone over full-screen graphics, standard)

Recap → Like → Subscribe → bell for "AI with Kalyan" → description panel (prompts + env block +
links) + pinned-comment card ("Which setup are you trying first: Ollama, OpenRouter or OmniRoute?")
→ "Thanks for watching / See you in the next video".

Suggested outro line:
> And that's how you can use Claude Code for free. I've put every prompt, the settings block and all
> the links in the description and the pinned comment. Tell me which setup you're trying first.
> If this helped, like the video and subscribe to AI with Kalyan. Thanks for watching, and I'll see
> you in the next video.

---

## Description assets to prepare

1. ChatGPT model prompt (+ "is this still the latest?" follow-up).
2. Antigravity: install-the-local-model prompt.
3. OpenRouter PowerShell block (+ cmd version). Placeholder key only.
4. Antigravity: OmniRoute install prompt.
5. Antigravity: desktop shortcuts prompt.
6. Antigravity: OmniRoute fix prompt (below).
7. Links: ollama.com, openrouter.ai, github.com/cheaper-inference/OmniRoute, build.nvidia.com,
   aistudio.google.com, antigravity.google.

## Suggested fix for the OmniRoute 503 (not tested here)

"All targets were skipped by pre-dispatch filter" means OmniRoute had no usable model for Claude
Code's request. The logs were mostly red and only Gemini connected, so the combo was probably
pointing at providers that were failing (NVIDIA check failed, Kimi paid, Kiro not finished) or at
models that can't do what Claude Code needs (tool calling, a large enough context window).

Paste into Antigravity:

> My OmniRoute setup gives "503 Service temporarily unavailable: all targets were skipped by
> pre-dispatch filter" when I say hi in Claude Code via my "Free Claude Code" shortcut.
> 1. Read the OmniRoute logs and tell me in one line why each target was skipped.
> 2. Test every connected provider and list which ones actually work. Only Gemini (Google AI Studio
>    key) is connected on my side; NVIDIA NIM showed "Invalid" on its key check.
> 3. Edit my combo so it only contains working free models that support tool calling and have at
>    least a 64K context window. Put a Gemini model first.
> 4. Make sure the model name Claude Code sends (and ANTHROPIC_MODEL / the Opus, Sonnet and Haiku
>    defaults in my launcher) points at that combo.
> 5. Restart OmniRoute, send a test "hi" through Claude Code, and show me the log line that proves
>    it worked.
> Don't print my API keys in the chat.

If NVIDIA should be in the pool, create a fresh key at build.nvidia.com and re-check it. A key that
fails the check is usually a copy/paste issue or the validation model; try saving with the
validation model empty.
