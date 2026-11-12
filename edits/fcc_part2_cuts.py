"""Part 2 (Method 2: OpenRouter) cut list. Take 1478 (detailed) + the full trap story from take 1475.
Timings from ElevenLabs Scribe (transcripts/IMG_1478, IMG_1475); every restart / stumble cut at word level."""
A, T = '1478', '1475'
CUTS = [
    (A, 17.9, 20.2),     # So method two is called OpenRouter.
    (A, 21.55, 32.2),    # OpenRouter is one website ... completely free. (2nd "OpenRouter")
    (A, 32.5, 38.0),     # The big difference from Ollama ... not on your laptop.
    (A, 42.8, 45.9),     # so they are much faster even on a basic laptop.
    (A, 50.3, 55.2),     # Go to openrouter.ai and sign up. It's free, no credit card needed.
    (A, 56.5, 65.4),     # Then click API keys and create key. A API key is basically a password ...
    (A, 65.7, 68.1),     # Give it a name. Mine is just The Claude.
    (A, 68.9, 77.9),     # Now, two seat belts. First, set an expiry. I set seven days ...
    (A, 88.5, 90.45),    # Second is to set a credit limit,   ("and I set it to zero" cut: the recording shows a $1 limit)
    (A, 92.35, 108.6),   # That means even if you click the wrong model ... Anyone who has it can use your account.
    (A, 114.8, 122.4),   # Now which models are free? Click Models ... slide it all the way to free.
    (A, 129.1, 134.8),   # Now you'll only see models with free in their name ... costs zero.
    (A, 149.0, 153.2),   # And here is an important tip. This list changes all the time.
    (A, 157.8, 169.9),   # Models come and go ... you'll always have a free model.
    (A, 180.7, 183.1),   # Now let's connect OpenRouter to Claude Code.
    (A, 183.3, 183.9),   # For that,
    (A, 186.8, 192.2),   # you paste a small block of settings into your terminal, and the whole block is in the setup kit.
    (A, 212.4, 214.6),   # For both PowerShell and command prompt.
    (A, 218.8, 222.3),   # these settings simply tell Claude Code, "Don't talk to Anthropic.
    (A, 224.8, 227.8),   # Talk to OpenRouter instead, and here is my key."
    (A, 234.0, 246.2),   # Let me show you what each line does ... Paste your key between these codes.
    (A, 246.3, 249.45),  # The third line clears out the old Anthropic key,
    (A, 251.6, 254.7),   # so there is no chance of falling back to a paid key.
    (A, 275.7, 280.45),  # And the last few lines point Claude Code's model slots, Opus, Sonnet,
    (A, 281.8, 284.8),   # and Haiku at openrouter/free.
    (A, 286.1, 292.5),   # openrouter/free is OpenRouter's free router. It picks a free model for you automatically.
    (A, 303.4, 310.4),   # Then open your folder, right-click, open the terminal, paste the block, hit Enter, and type Claude.
    (A, 319.9, 326.6),   # One thing to know here ... so next time you paste them again.
    (A, 328.0, 330.8),   # Or you let Antigravity make you a shortcut.
    (T, 206.45, 208.6),  # And this is where I almost got fooled.          (take 1475)
    (T, 209.3, 214.0),   # My paste failed silently. I typed Claude, it opened, and it looked fine.
    (T, 214.3, 218.2),   # Look at the top line. Spot anything wrong? Claude Pro.
    (T, 222.1, 229.4),   # Claude Code had quietly gone back to my paid subscription. If you see your Claude plan here, you're not on a free setup.
    (A, 359.1, 363.2),   # I opened a fresh terminal, entered the settings one line at a time,
    (A, 364.95, 365.8),  # typed Claude,
    (A, 369.5, 376.4),   # Now it says openrouter/free. API usage billing. That's the free one.
    (A, 381.9, 389.1),   # Now let's check it's really free. Type /model. You'll see Opus, Sonnet, and Haiku,
    (A, 390.6, 395.1),   # but those are just the names of the slots, not what's actually answering.
    (A, 399.1, 404.7),   # I asked it, "Which model are you?" And it said it's a free model running through OpenRouter.
    (A, 411.0, 415.2),   # But a model's word isn't a proof, so let's check the bill.
    (A, 418.9, 427.4),   # Go to OpenRouter and open the activity page. This is the real log ...
    (A, 443.6, 452.2),   # So before I scroll down, how much do you think this cost me? Three requests ... zero dollars.
    (A, 457.3, 459.1),   # and one more thing that might scare you,
    (A, 478.25, 482.8),  # if you type /usage in Claude Code, it might say something like thirteen cents.
    (A, 483.1, 488.5),   # Relax. That's just Claude Code estimating the cost at Anthropic's prices.
    (A, 491.1, 494.6),   # the real bill is on OpenRouter, and it says zero.
    (A, 502.6, 504.2),   # But of course, there is a catch.
    (A, 504.98, 505.9),  # two actually.
    (A, 506.2, 507.9),   # First, limits.
    (A, 517.3, 521.2),   # Free models are capped about fifty requests a day on a new account,
    (A, 534.9, 546.0),   # Fifty sounds like plenty ... and fixes what it broke.
    (A, 546.3, 549.4),   # Hit the cap and you'll see error four twenty-nine.
    (A, 551.25, 553.7),  # four twenty-nine is just the server saying,
    (A, 557.7, 560.5),   # "you have used your free quota. Come back later."
    (A, 564.2, 566.1),   # And the second is the privacy.
    (A, 566.4, 571.15),  # Unlike Ollama, your prompts and your code now go to someone else's service,
    (A, 574.45, 578.5),  # so don't send client code or passwords through free Claude models.
    (A, 582.3, 583.7),   # keep those on Ollama.
    (A, 591.7, 593.7),   # So quick question before method three.
    (A, 594.1, 598.4),   # Which one are you leaning towards so far, Ollama or the OpenRouter?
    (A, 600.95, 603.0),  # or are you waiting for the next one?
    (A, 603.2, 605.8),   # Tell me in the comments. I actually read them.
    (A, 607.5, 610.9),   # because method three is where it gets really interesting.
]
