"""Part 2 (Method 2: OpenRouter): same treatment as Part 1 v5. Face card bottom-left; screen recordings pinned to the spoken line
(OCR index), cropped to the app window and blurred where a key, email, bookmark or work chat would show."""
import importlib.util, json, os
_d = os.path.dirname(__file__)
_s = importlib.util.spec_from_file_location('p2cuts', os.path.join(_d, 'fcc_part2_cuts.py'))
_m = importlib.util.module_from_spec(_s); _s.loader.exec_module(_m)
CUTS = _m.CUTS
SPEED = 1.05
CHROME = 'win'    # Windows-style window frames (whole video)
JUMPCUT = True    # skipped footage is cut past, never fast-forwarded on screen
PAUSE_KEEP = 0.2
A, T = '1478', '1475'
FILES = {'BR-ORM': os.path.join(_d, '..', 'media', 'broll', 'openrouter-free-models-still.mp4')}
MG = {s['id']: s for s in json.load(open(os.path.join(_d, '..', 'compositions', 'fcc-part2-mg', 'scenes.json')))}
def mg(sid): return dict(at=('OUT', MG[sid]['start']), kind='mg', mg=sid, mgdir='fcc-part2-mg')
def S(take, phrase, src, after, z=None):
    d = dict(at=(take, phrase, after), src=src)
    if z: d['z'] = z
    return d
WIDE = (0.5, 0.5, 1.0)
C = 1222
OR_CROP = (0.0, 0.13, 1.0, 1.0)                    # 154411: drop tabs + bookmarks bar (work links)
TERM_CROP = (0.0, 0.055, 1.0, 1.0)                 # 123051: drop the tab/URL bar
TRAP_CROP = (0.14, 0.25, 1.0, 1.0)                 # 121640: terminal only (claude.ai chats, DXC, key fragment sit outside)
KEY_LINE = dict(t0=0, t1=262, r=(0.0, 0.25, 0.62, 0.325))      # the pasted AUTH_TOKEN line in 123051 (full key in plain text)
KEY_TOP = dict(t0=0, t1=999, r=(0.2, 0.81, 0.47, 0.89))         # masked key name on the Activity page

BADGES = [(('OUT', 0.0), 4, 'Method 2 · OpenRouter'), ((A, "Now let's connect OpenRouter", 180.0), 5, 'Connect Claude Code'),
          ((T, 'And this is where I almost got fooled', 206.0), 6, 'The trap'), ((A, 'But of course, there is a catch', 502.0), 7, 'The catch')]
FX = [dict(at=(A, 'Which one are you leaning towards', 594.0), dur=4.0, fx='comment-box', text='OPENROUTER')]

SHOTS = [
    mg('p2open'),
    # sign up + key (real recording, browser bars cropped off; the email-verification dialog is never shown)
    dict(at=(A, 'Go to openrouter.ai', 50.0), kind='demo', clip=('154411', 90, 120), url='openrouter.ai', header='Get your key', crop=OR_CROP, sync=[
        S(A, 'Go to openrouter.ai', 90.5, 50.0, (0.3, 0.3, 1.4)),
        S(A, 'Then click API keys', 97.0, 56.0, WIDE),
        S(A, 'Give it a name', 103.0, 65.0, (0.49, 0.25, 1.7)),
        S(A, 'First, set an expiry', 105.5, 69.0, (0.49, 0.4, 1.7)),
        S(A, 'I set seven days', 108.0, 72.0, (0.49, 0.4, 1.7)),
        S(A, 'set a credit limit', 110.0, 88.0, (0.49, 0.62, 1.6)),
        S(A, 'That means even if you click the wrong model', 116.0, 92.0, (0.49, 0.56, 1.6))],
         pills=[dict(at=(A, "It's free, no credit card", 53.0), text='Free · no credit card', icon='check'),
                dict(at=(A, 'A API key is basically a password', 59.0), text='API key = a password for apps', icon='key-round'),
                dict(at=(A, 'Now, two seat belts', 69.0), text='2 seat belts', icon='shield-check', red=True),
                dict(at=(A, 'I set seven days', 72.0), text='1 · Expires in 7 days', icon='clock'),
                dict(at=(A, 'set a credit limit', 88.0), text='2 · Credit limit → it can\'t charge you', icon='coins')]),
    dict(at=(A, 'and copy the key straight away', 96.0), kind='demo', clip=('154411', 135.5, 140), url='openrouter.ai · your new key', header='Copy it once',
         crop=OR_CROP, blurs=[dict(t0=0, t1=999, r=(0.29, 0.36, 0.58, 0.43))], zooms=[(135.5, 0.49, 0.32, 1.6)],
         pills=[dict(at=(A, 'shows it only once', 99.0), text='Shown only once → copy it now', icon='key-round', red=True),
                dict(at=(A, 'Anyone who has it can use your account', 105.0), text='Treat it like a password', icon='lock')]),
    # free models: live capture of openrouter.ai/models with the price filter at FREE
    dict(at=(A, 'Now which models are free?', 114.0), kind='demo', clip=('BR-ORM', 0, 11), url='openrouter.ai/models', header='Free models', sync=[
        S(A, 'Click Models at the top', 0.5, 116.0, (0.64, 0.12, 2.0)),
        S(A, 'in the price filter on the left', 1.0, 116.0, (0.1, 0.46, 2.2)),
        S(A, 'only see models with free in their name', 2.0, 129.0, (0.33, 0.33, 1.5)),
        S(A, 'every request to those costs zero', 3.0, 129.0, (0.34, 0.32, 1.9))],
         pills=[dict(at=(A, 'slide it all the way to free', 116.0), text='Price filter → FREE', icon='gauge', red=True),
                dict(at=(A, 'every request to those costs zero', 129.0), text='$0 per request', icon='coins')]),
    mg('p2tip'), mg('p2settings'), mg('p2session'),
    # the trap: real recording, terminal only
    dict(at=(T, 'And this is where I almost got fooled', 206.0), kind='demo', clip=('121640', 160.5, 184), url='PowerShell', header='The trap',
         crop=TRAP_CROP, sync=[
        S(T, 'My paste failed silently', 160.5, 209.0, (0.4, 0.22, 1.5)),
        S(T, 'I typed Claude', 167.0, 211.0, (0.3, 0.4, 1.5)),
        S(T, 'it opened, and it looked fine', 172.0, 211.0, WIDE),
        S(T, 'Look at the top line', 174.0, 214.0, (0.22, 0.15, 2.0))],
         mags=[dict(at=(T, 'Claude Pro', 217.0), r=(0.0, 0.07, 0.42, 0.22), w=860, cx=C, cy=420, dur=5.5)],
         pills=[dict(at=(T, 'My paste failed silently', 209.0), text='Paste failed · no warning', icon='triangle-alert', red=True),
                dict(at=(T, 'Claude Code had quietly gone back', 222.0), text='Back on your PAID plan', icon='coins', red=True),
                dict(at=(T, 'If you see your Claude plan here', 225.0), text='See "Claude Pro"? Not free.', icon='x')]),
    # the fix: settings line by line (pasted key line blurred) -> openrouter/free · API Usage Billing
    dict(at=(A, 'I opened a fresh terminal', 359.0), kind='demo', clip=('123051', 198, 276), url='PowerShell · Claude Code', header='The fix',
         crop=TERM_CROP, blurs=[KEY_LINE], sync=[
        S(A, 'entered the settings one line at a time', 210.0, 359.0, (0.35, 0.3, 1.3)),
        S(A, 'typed Claude', 258.0, 364.0, (0.35, 0.3, 1.3)),
        S(A, 'Now it says openrouter/free', 266.0, 369.0, (0.28, 0.18, 1.9))],
         mags=[dict(at=(A, 'Now it says openrouter/free', 369.0), r=(0.12, 0.12, 0.47, 0.24), w=900, cx=C, cy=380, dur=4.0)],
         pills=[dict(at=(A, "That's the free one", 375.0), text='openrouter/free · API Usage Billing ✓', icon='check', red=True)]),
    dict(at=(A, "Now let's check it's really free", 381.0), kind='demo', clip=('123051', 278, 350), url='Claude Code', header='Is it really free?',
         crop=TERM_CROP, sync=[
        S(A, 'Type /model', 282.0, 384.0, (0.4, 0.3, 1.3)),
        S(A, 'but those are just the names of the slots', 290.0, 390.0, (0.4, 0.3, 1.3)),
        S(A, 'I asked it', 328.0, 399.0, (0.45, 0.42, 1.4)),
        S(A, "it said it's a free model", 346.0, 399.0, (0.5, 0.5, 1.3))],
         mags=[dict(at=(A, "it said it's a free model", 399.0), r=(0.05, 0.45, 0.97, 0.57), w=1100, cx=C, cy=380, dur=3.5)],
         pills=[dict(at=(A, 'just the names of the slots', 390.0), text='Opus / Sonnet / Haiku = slot names only', icon='app-window')]),
    dict(at=(A, "But a model's word isn't a proof", 411.0), kind='talk'),
    dict(at=(A, 'Go to OpenRouter and open the activity page', 418.0), kind='demo', clip=('123051', 354, 400), url='openrouter.ai/activity', header='The bill',
         crop=TERM_CROP, blurs=[KEY_TOP, dict(t0=0, t1=380.5, r=(0.17, 0.55, 0.94, 0.71))], sync=[
        S(A, 'This is the real log', 362.0, 420.0, (0.5, 0.45, 1.15)),
        S(A, 'how much do you think this cost me', 372.0, 443.0, (0.55, 0.6, 1.3)),
        S(A, 'Three requests', 381.0, 448.0, (0.55, 0.6, 1.3))],
         mags=[dict(at=(A, 'Three requests', 448.0), r=(0.17, 0.53, 0.94, 0.69), w=1100, cx=C, cy=380, dur=4.0)],
         pills=[dict(at=(A, 'Three requests', 448.0), text='3 requests · 24.6K tokens · $0.00', icon='receipt', red=True)]),
    dict(at=(A, 'and one more thing that might scare you', 457.0), kind='demo', clip=('123051', 424, 440), url='Claude Code · /usage', header='/usage',
         crop=TERM_CROP, zooms=[(424, 0.4, 0.32, 1.4)],
         mags=[dict(at=(A, 'thirteen cents', 478.0), r=(0.07, 0.27, 0.73, 0.36), w=1000, cx=C, cy=380, dur=3.0)],
         pills=[dict(at=(A, 'Relax', 483.0), text='Just an estimate at Anthropic prices', icon='gauge')]),
    dict(at=(A, 'the real bill is on OpenRouter', 491.0), kind='demo', clip=('123051', 395, 410), url='openrouter.ai/activity', header='The real bill',
         crop=TERM_CROP, blurs=[KEY_TOP], zooms=[(395, 0.55, 0.6, 1.3)],
         pills=[dict(at=(A, 'and it says zero', 491.0), text='Real bill: $0.00', icon='check', red=True)]),
    dict(at=(A, 'But of course, there is a catch', 502.0), kind='talk'),
    dict(at=(A, 'First, limits', 506.0), kind='talk'),
    mg('p2catch'), mg('p2privacy'),
    dict(at=(A, 'So quick question before method three', 591.0), kind='talk'),
]
# the catch scene starts on "But of course" in its own timing; keep the talk beat first, then the scene
SHOTS = [s for s in SHOTS if not (s.get('kind') == 'talk' and s['at'][1] in ('But of course, there is a catch', 'First, limits'))]
