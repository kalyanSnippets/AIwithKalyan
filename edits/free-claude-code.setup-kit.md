# Free Claude Code: Setup Kit
*From the AI with Kalyan video "Claude Code for $0: 3 free ways". Copy, paste, done.*

> Free tiers change often. Check each provider's current limits and terms before you rely on them.
> Cloud providers can see what you send. Keep private code on Method 1 (Ollama).

---

## Method 1 · Ollama (free, on your laptop, works offline)

### 1. Install
- Download: **https://ollama.com/download** (Windows, Mac, Linux). Run the installer.
- Settings: **Cloud → off** · **Context length → 64K**.

### 2. Which model for your RAM?
Check your RAM: **Ctrl + Shift + Esc → Performance → Memory** (Mac: Apple menu → About This Mac).

| Your RAM | Pick | Examples (check ollama.com/library for the latest) |
|---|---|---|
| 8–16 GB | Small, ~4–12B | `qwen3.5:4b` (what I used to warm up) · `mimo-v2.6:9b` (my pick on 16 GB) |
| 32 GB | Medium, ~20–35B | the latest "coder" model in the 20–35B range |
| 64 GB+ | Large, 70B+ | the biggest coding model that fits in about half your RAM |

⚠️ *Model names change often. Search ollama.com/library for the latest version before you pull one.*

### 3. Prompt: ask an AI which model to run
```
I have [YOUR RAM] GB of RAM and [YOUR GRAPHICS CARD, or "no graphics card"].
I want to run a local model on Ollama for coding with Claude Code.
Give me the best model for my laptop, its exact Ollama name, and make sure it's the latest one available today.
```

### 4. Prompt: let Antigravity install it (antigravity.google)
```
I'm running AI models locally with Ollama. Install the model [EXACT OLLAMA NAME] and set everything up so it works with Ollama.
If Ollama needs an update, update it. If any step fails, fix it and keep going.
```

### 5. Put Claude Code on it
Ollama → **Apps → Claude Code** (copies the command), or type:
```
ollama launch claude
```
Run it in a terminal inside your project folder and pick your model.

---

## Method 2 · OpenRouter (free cloud models)

### 1. Key
**https://openrouter.ai** → sign up → **API Keys → Create key** → expiry **7 days** · credit limit **$0** → copy it (it's shown once).

### 2. Free models
**https://openrouter.ai/models** → price filter **FREE** → look for "(free)".

### 3. Settings block: Windows PowerShell
Open your project folder → right-click → **Open in Terminal**, then paste. Replace only `YOUR_OPENROUTER_KEY`.
```powershell
$env:ANTHROPIC_BASE_URL = "https://openrouter.ai/api"
$env:ANTHROPIC_AUTH_TOKEN = "YOUR_OPENROUTER_KEY"
$env:ANTHROPIC_API_KEY = ""
$env:ANTHROPIC_MODEL = "openrouter/free"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = "openrouter/free"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = "openrouter/free"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = "openrouter/free"
claude
```

### 3b. Settings block: Command Prompt (cmd)
```bat
set ANTHROPIC_BASE_URL=https://openrouter.ai/api
set ANTHROPIC_AUTH_TOKEN=YOUR_OPENROUTER_KEY
set ANTHROPIC_API_KEY=
set ANTHROPIC_MODEL=openrouter/free
set ANTHROPIC_DEFAULT_OPUS_MODEL=openrouter/free
set ANTHROPIC_DEFAULT_SONNET_MODEL=openrouter/free
set ANTHROPIC_DEFAULT_HAIKU_MODEL=openrouter/free
claude
```

### 3c. Mac / Linux (bash or zsh)
```bash
export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
export ANTHROPIC_AUTH_TOKEN="YOUR_OPENROUTER_KEY"
export ANTHROPIC_API_KEY=""
export ANTHROPIC_MODEL="openrouter/free"
export ANTHROPIC_DEFAULT_OPUS_MODEL="openrouter/free"
export ANTHROPIC_DEFAULT_SONNET_MODEL="openrouter/free"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="openrouter/free"
claude
```

### ⚠️ The trap
If the top line in Claude Code shows **your Claude plan (e.g. "Claude Pro")**, the settings didn't apply and you're on your **paid** account.
You want to see **openrouter/free**. These settings only last for that terminal window.

### ✅ Check the bill
**https://openrouter.ai/activity**: this is the real cost. Claude Code's `/usage` is only an estimate at Anthropic prices.

---

## Method 3 · OmniRoute (many free providers, auto-switch)

GitHub: **https://github.com/cheaper-inference/OmniRoute** (free, open source).

### 1. Prompt: install OmniRoute (paste into Antigravity)
```
Please help me set up Claude Code on my laptop so I can use it for free.
Start by checking whether Claude Code is already installed. If it's not, install it with Anthropic's official installer.
Next, install OmniRoute from GitHub: github.com/cheaper-inference/OmniRoute.
Once that's done, run OmniRoute on localhost and open its dashboard in my browser.
If any step fails, fix the problem and keep going.
```
Dashboard: **http://localhost:20128** · first password **CHANGEME** → change it in Settings.

### 2. Connect free providers (Dashboard → Providers → search → Add)
| Provider | How | Notes |
|---|---|---|
| **Gemini** | Google AI Studio → **Get API key → Create** → paste → **Check** → Save | https://aistudio.google.com |
| **NVIDIA** | build.nvidia.com → **API Keys → Generate API Key** → paste | Turn on **"Import only free models"** |
| **OpenRouter** | Same key as Method 2 | Free models only |
| **Kiro** ⚠️ | Sign in → approve the code | Includes Claude models. Small free allowance. OmniRoute flags its terms: **your account, your call** |
| **Antigravity** ⚠️ | Google sign-in → copy the address of the page that doesn't load → paste back | **Use a spare Google account.** OmniRoute warns the account may be restricted |

### 3. Combo
**Combos → Create** → name it `claude` → add steps (provider → model) → order with the arrows → strategy: smart routing → **Save**.

### 4. OmniRoute API key
**API Keys → Create API Key** → name `claude-code` → **copy it once**. Don't paste it into any AI chat.

### 5. Prompt: desktop shortcuts (paste into Antigravity)
```
Create a shortcut on my Desktop called "Free Claude Code". When I double-click it, it should make sure OmniRoute is running
(start it if it isn't), then open a terminal inside the omniroute-work folder and run this command:
omniroute run claude --model claude
The terminal window must stay open.

Create a second shortcut on my Desktop called "OmniRoute Dashboard". When I double-click it, it should make sure OmniRoute
is running, then open its dashboard in my browser.

When you need my OmniRoute API key, don't ask me to paste it into this chat. Open a file for me, I'll paste it there and type continue.
Test both shortcuts and show me Claude Code running through OmniRoute. If anything fails, fix it and continue.
```

### 6. Prompt: hide paid models (paste into Antigravity)
```
OmniRoute is running on my laptop, and Claude Code connects through it. Problem: Claude Code's /model menu shows every model
from my providers, including paid ones, and picking them causes errors or charges.
Fix it in OmniRoute's settings: hide the paid models so only free models show up, and keep my combo called "claude" as the default model.
Then open Claude Code with the "Free Claude Code" shortcut on my Desktop, check that /model only shows free models,
send "hi", and make sure it replies fast. If anything fails, fix it and continue.
```

### ✅ Check the receipt
Dashboard → **Logs**: see which provider and model actually answered each request, and the status (200 = success).

---

## 4 rules
1. **Nothing is unlimited.** Every free tier has a cap.
2. **Cloud providers see what you send.** Private code stays on Ollama.
3. **Kiro / Antigravity may break their terms.** Spare accounts, your call.
4. **Things break.** Copy the error → paste it into Antigravity → "fix this".

**Always check the bill, not the label.**

*Like it? Subscribe to AI with Kalyan for more tested AI tools.*
